from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import random

app = FastAPI()

# Habilita CORS para seu frontend (assumindo localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Modelos Pydantic para resposta
class Telemetry(BaseModel):
    timestamp: datetime
    latitude: float
    longitude: float
    altitude_meters: float
    gyro_x: float
    gyro_y: float
    gyro_z: float
    speed_mps: float


class Summary(BaseModel):
    max_altitude: float
    total_duration_seconds: int
    recorded_points: int
    max_speed: Optional[float] = None


# Dados fake globais
telemetry_data: List[Telemetry] = []
summary_data: Optional[Summary] = None


# Função para gerar dados fake
def generate_fake_data():
    global telemetry_data, summary_data
    base_time = datetime.utcnow() - timedelta(minutes=30)
    telemetry_data = []
    for i in range(100):
        telemetry_data.append(
            Telemetry(
                timestamp=base_time + timedelta(seconds=i * 10),
                latitude=-15.8 + random.uniform(-0.1, 0.1),
                longitude=-47.9 + random.uniform(-0.1, 0.1),
                altitude_meters=random.uniform(0, 15000),
                gyro_x=random.uniform(-0.05, 0.05),
                gyro_y=random.uniform(-0.05, 0.05),
                gyro_z=random.uniform(-0.05, 0.05),
                speed_mps=random.uniform(0, 3000),
            )
        )
    max_altitude = max(t.altitude_meters for t in telemetry_data)
    max_speed = max(t.speed_mps for t in telemetry_data)
    total_duration_seconds = int((telemetry_data[-1].timestamp - telemetry_data[0].timestamp).total_seconds())
    recorded_points = len(telemetry_data)
    summary_data = Summary(
        max_altitude=max_altitude,
        total_duration_seconds=total_duration_seconds,
        recorded_points=recorded_points,
        max_speed=max_speed,
    )


generate_fake_data()


@app.get("/api/telemetry/launch/{launch_id}", response_model=List[Telemetry])
async def get_telemetry(launch_id: int):
    # Ignora launch_id por simplicidade, retorna dados fake
    return telemetry_data


@app.get("/api/telemetry/summary/{launch_id}", response_model=Summary)
async def get_summary(launch_id: int):
    # Ignora launch_id por simplicidade, retorna dados fake
    if not summary_data:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary_data


# Endpoint para regenerar dados (opcional)
@app.post("/api/telemetry/regenerate")
async def regenerate_data():
    generate_fake_data()
    return {"status": "data regenerated"}