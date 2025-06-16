from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timedelta
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def generate_fake_data(start_time, duration_seconds=100):
    data = []
    for i in range(duration_seconds):
        time = start_time + timedelta(seconds=i)
        data.append({
            'timestamp': time,
            'altitude_meters': random.uniform(0, 1000),  
            'speed_mps': random.uniform(0, 200),         
            'gyro_x': random.uniform(-10, 10),           
            'gyro_y': random.uniform(-10, 10),
            'gyro_z': random.uniform(-10, 10),
            'latitude': -23.5505 + random.uniform(-0.1, 0.1),
            'longitude': -46.6333 + random.uniform(-0.1, 0.1)
        })
    return data

@app.get("/api/launches")
async def get_launches():
    #3 lançamentos exemplos
    launches = [
        {"id": i, "launch_date": datetime.now() - timedelta(days=i*2)} 
        for i in range(1, 4)
    ]
    return launches

@app.get("/api/telemetry/launch/{launch_id}")
async def get_telemetry(launch_id: int):
    random.seed(launch_id)
    start_time = datetime.now() - timedelta(days=launch_id*2)
    return generate_fake_data(start_time)

@app.get("/api/telemetry/summary/{launch_id}")
async def get_telemetry_summary(launch_id: int):
    #resumo/média
    random.seed(launch_id)
    return {
        "max_altitude": random.uniform(800, 1000),
        "max_speed": random.uniform(150, 200),
        "duration": 100,
        "status": "Concluído"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)