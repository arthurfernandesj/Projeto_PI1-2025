from typing import List, Optional
from datetime import timedelta, timezone
from model.model import Telemetry, Summary
import random

# Dados fake globais
telemetry_data: List[Telemetry] = []
summary_data: Optional[Summary] = None


def generate_fake_data_telemetry():
    base_time = timezone.utc() - timedelta(minutes=30)
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

    return telemetry_data


# Função para gerar dados fake
def generate_fake_data_summary():
    base_time = timezone.utc() - timedelta(minutes=30)
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

    return summary_data