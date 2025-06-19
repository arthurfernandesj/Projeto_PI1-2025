# services/telemetry_service.py

from sqlalchemy.orm import Session
from database.models import RocketTelemetry, RocketTelemetryAnalysis
from database.database import SessionLocal
from model.model import Telemetry, Summary
from typing import List


def get_telemetries_from_db(launch_id: int) -> List[Telemetry]:
    db: Session = SessionLocal()
    try:
        results = (
            db.query(RocketTelemetry)
            .filter(RocketTelemetry.launch_id == launch_id)
            .order_by(RocketTelemetry.timestamp)
            .all()
        )
        return [Telemetry.model_validate(r) for r in results]
    finally:
        db.close()


def get_summary_from_db(launch_id: int) -> Summary:
    db: Session = SessionLocal()
    try:
        result = (
            db.query(RocketTelemetryAnalysis)
            .filter(RocketTelemetryAnalysis.launch_id == launch_id)
            .first()
        )
        if result is None:
            return None
        return Summary.model_validate(result)
    finally:
        db.close()