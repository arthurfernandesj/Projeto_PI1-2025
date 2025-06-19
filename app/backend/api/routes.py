from fastapi import HTTPException, APIRouter
from typing import List
from model.model import Telemetry, Summary
from controller import controller

router = APIRouter()


@router.get("/api/telemetry/launchs/", response_model=List[Telemetry])
async def get_telemetry_list():
    return controller.get_all_telemetries()


@router.get("/api/telemetry/launch/{launch_id}", response_model=List[Telemetry])
async def get_telemetry(launch_id: int):
    return controller.get_telemetry_by_launch(launch_id)


@router.get("/api/telemetry/summary/", response_model=Summary)
async def get_summary_default():
    summary = controller.get_summary()
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary


@router.get("/api/telemetry/summary/{launch_id}", response_model=Summary)
async def get_summary_by_launch(launch_id: int):
    summary = controller.get_summary_by_launch(launch_id)
    if not summary:
        raise HTTPException(status_code=404, detail="Summary not found")
    return summary


@router.post("/api/telemetry/regenerate")
async def regenerate():
    return controller.regenerate_data()