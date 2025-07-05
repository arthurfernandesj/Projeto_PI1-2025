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


# services/telemetry_service.py
def get_all_telemetries() -> List[Telemetry]:
    db: Session = SessionLocal()
    try:
        results = db.query(RocketTelemetry).all()
        return [Telemetry.model_validate(r) for r in results]
    finally:
        db.close()


def get_all_launches():
    from model.model import Launch
    db: Session = SessionLocal()
    try:
        results = db.query(RocketTelemetry.launch_id).distinct().order_by(RocketTelemetry.launch_id).all()
        launches = []
        for result in results:
            launch_id = result[0]
            launch_record = db.query(RocketTelemetry).filter(RocketTelemetry.launch_id == launch_id).first()
            if launch_record:
                launches.append(Launch(id=launch_id, launch_date=launch_record.timestamp))
        return launches
    finally:
        db.close()


def get_launches_paginated(page: int, page_size: int):
    from model.model import Launch, LaunchesResponse
    import math
    
    db: Session = SessionLocal()
    try:
        # Contar total de lançamentos únicos
        total_count = db.query(RocketTelemetry.launch_id).distinct().count()
        
        # Calcular offset
        offset = (page - 1) * page_size
        
        # Buscar lançamentos com paginação
        results = (
            db.query(RocketTelemetry.launch_id)
            .distinct()
            .order_by(RocketTelemetry.launch_id.desc())  # Mais recentes primeiro
            .offset(offset)
            .limit(page_size)
            .all()
        )
        
        launches = []
        for result in results:
            launch_id = result[0]
            launch_record = db.query(RocketTelemetry).filter(RocketTelemetry.launch_id == launch_id).first()
            if launch_record:
                launches.append(Launch(id=launch_id, launch_date=launch_record.timestamp))
        
        total_pages = math.ceil(total_count / page_size)
        
        return LaunchesResponse(
            launches=launches,
            total_count=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
    finally:
        db.close()
