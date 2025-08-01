#include <TinyGPS++.h>
#include <HardwareSerial.h>
#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

// Wi-Fi Access Point
const char *ssid = "ESP32-GPS";
const char *password = "12345678";
WebServer server(80);

// GPS e MPU
TinyGPSPlus gps;
HardwareSerial gpsSerial(1);
Adafruit_MPU6050 mpu;

// Offsets
float gyro_offset_x = 0, gyro_offset_y = 0, gyro_offset_z = 0;
float accel_offset_x = 0, accel_offset_y = 0, accel_offset_z = 0;

bool coletaAtiva = false;

void calibrarGiroscopio() {
  sensors_event_t a, g, temp;
  for (int i = 0; i < 100; i++) {
    mpu.getEvent(&a, &g, &temp);
    gyro_offset_x += g.gyro.x;
    gyro_offset_y += g.gyro.y;
    gyro_offset_z += g.gyro.z;
    delay(10);
  }
  gyro_offset_x /= 100;
  gyro_offset_y /= 100;
  gyro_offset_z /= 100;
}

void calibrarAcelerometro() {
  sensors_event_t a, g, temp;
  for (int i = 0; i < 100; i++) {
    mpu.getEvent(&a, &g, &temp);
    accel_offset_x += a.acceleration.x;
    accel_offset_y += a.acceleration.y;
    accel_offset_z += a.acceleration.z - 9.8;
    delay(10);
  }
  accel_offset_x /= 100;
  accel_offset_y /= 100;
  accel_offset_z /= 100;
}

String obterDados() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);

  float gx_corr = g.gyro.x - gyro_offset_x;
  float gy_corr = g.gyro.y - gyro_offset_y;
  float gz_corr = g.gyro.z - gyro_offset_z;

  float ax_corr = a.acceleration.x - accel_offset_x;
  float ay_corr = a.acceleration.y - accel_offset_y;
  float az_corr = a.acceleration.z - accel_offset_z;

  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isValid()) {
    double latitude = gps.location.lat();
    double longitude = gps.location.lng();
    double altitude = gps.altitude.meters();
    double velocidade = gps.speed.mps();

    int ano = gps.date.year();
    int mes = gps.date.month();
    int dia = gps.date.day();
    int hora = gps.time.hour() - 3;
    int minuto = gps.time.minute();
    int segundo = gps.time.second();
    int millisecond = gps.time.centisecond() * 10;

    char timestamp[30];
    sprintf(timestamp, "%04d-%02d-%02d %02d:%02d:%02d.%03d",
            ano, mes, dia, hora, minuto, segundo, millisecond);

    String valores = 
      String(latitude, 6) + "," +
      String(longitude, 6) + "," + 
      String(altitude, 6) + "," + 
      String(velocidade, 6) + "," +
      String(gx_corr, 6) + "," + 
      String(gy_corr, 6) + "," + 
      String(gz_corr, 6) + "," +
      String(ax_corr, 6) + "," +
      String(ay_corr, 6) + "," +
      String(az_corr, 6) + "," +
      String(timestamp);

    return valores;
  }

  return "invalid,invalid,invalid,invalid,invalid,invalid,invalid,invalid,invalid,invalid,invalid";
}

void setup() {
  Serial.begin(115200);
  gpsSerial.begin(9600, SERIAL_8N1, 16, 17); // RX2, TX2

  // MPU6050
  if (!mpu.begin()) {
    Serial.println("Erro: MPU6050 não detectado!");
    while (true);
  }
  mpu.setAccelerometerRange(MPU6050_RANGE_8_G);
  mpu.setGyroRange(MPU6050_RANGE_500_DEG);
  mpu.setFilterBandwidth(MPU6050_BAND_21_HZ);
  calibrarGiroscopio();
  calibrarAcelerometro();

  // Wi-Fi Access Point
  WiFi.softAP(ssid, password);
  Serial.print("AP IP address: ");
  Serial.println(WiFi.softAPIP());

  // Rota de dados
  server.on("/dados", []() {
    if (coletaAtiva) {
        String data = obterDados();
        server.send(200, "text/plain", data);        
    } else {
        server.send(200, "text/plain", "coleta_desativada");
    }
  });

    // Ativar coleta
    server.on("/iniciar", []() {
        coletaAtiva = true;
        server.sendHeader("Access-Control-Allow-Origin", "*");
        server.send(200, "text/plain", "Coleta iniciada");
        Serial.println("Coleta iniciada remotamente.");
    });

    // Parar coleta
    server.on("/parar", []() {
        coletaAtiva = false;
        server.sendHeader("Access-Control-Allow-Origin", "*");
        server.send(200, "text/plain", "Coleta parada");
        Serial.println("Coleta parada remotamente.");
    });

  server.begin();
  Serial.println("Servidor HTTP iniciado");
}

void loop() {
  server.handleClient();
}
