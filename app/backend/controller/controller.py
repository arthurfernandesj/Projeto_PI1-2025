# controllers/telemetry_controller.py

from typing import List
from fastapi import HTTPException
from model.model import Telemetry, Summary
from services import telemetry_service


def get_telemetry_by_launch(launch_id: int) -> List[Telemetry]:
    data = telemetry_service.get_telemetries_from_db(launch_id)
    if not data:
        raise HTTPException(status_code=404, detail="Telemetry not found")
    return data


def get_summary_by_launch(launch_id: int) -> Summary:
    summary = telemetry_service.get_summary_from_db(launch_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary


# controllers/telemetry_controller.py
def get_all_telemetries() -> List[Telemetry]:
    return telemetry_service.get_all_telemetries()