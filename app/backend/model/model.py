# model/model.py

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class Telemetry(BaseModel):
    id: int
    launch_id: int
    timestamp: datetime
    latitude: float
    longitude: float
    altitude_meters: float
    gyro_x: float
    gyro_y: float
    gyro_z: float
    speed_mps: Optional[float]

    class Config:
        from_attributes = True


class Launch(BaseModel):
    id: int
    launch_date: datetime

    class Config:
        from_attributes = True


class Summary(BaseModel):
    id: int
    launch_id: int
    avg_altitude: Optional[float]
    max_altitude: Optional[float]
    min_altitude: Optional[float]
    avg_speed: Optional[float]
    max_speed: Optional[float]
    min_speed: Optional[float]
    total_duration_seconds: Optional[int]
    recorded_points: Optional[int]

    class Config:
        from_attributes = True