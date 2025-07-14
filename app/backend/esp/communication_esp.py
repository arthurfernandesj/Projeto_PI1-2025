import os
import csv
import time
import requests
from dotenv import load_dotenv

load_dotenv()

ESP_CONNECTION = os.getenv("ESP_URL")

url = f"{ESP_CONNECTION}/dados"

with open('./backend/esp/dados_wifi.csv', 'w', newline='') as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(['lat', 'lng', 'alt', 'vel', 'gx', 'gy', 'gz', 'ax', 'ay', 'az', 'time'])

    print("Conectado ao ESP32 via Wi-Fi. Coletando dados...")
    try:
        while True:
            try:
                response = requests.get(url, timeout=2)
                linha = response.text.strip()
                if linha.startswith("invalid"):
                    print("Aguardando fix do GPS...")
                    continue
                valores = linha.split(',')
                if len(valores) == 11:
                    writer.writerow(valores)
                    csvfile.flush()
                    print("Salvo:", linha)
                else:
                    print("Linha inválida:", linha)
            except Exception as e:
                print("Erro de conexão:", e)
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nFinalizado pelo usuário.")