from fastapi import HTTPException, APIRouter, Query
from typing import List
from model.model import Telemetry, Summary, Launch, LaunchesResponse
from controller import controller
import httpx

router = APIRouter()


@router.get("/api/launches/", response_model=LaunchesResponse)
async def get_launches(
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(9, ge=1, le=50, description="Itens por página")
):
    return controller.get_launches_paginated(page, page_size)

@router.get("/api/data/load", response_model=Summary)
async def load_csv_data():
    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get("http://192.168.4.1/parar")
            resp.raise_for_status()
        except httpx.RequestError as e:
            raise HTTPException(502, f"Erro ao falar com a ESP: {e}")
        except httpx.HTTPStatusError as e:
            raise HTTPException(e.response.status_code, f"ESP retornou erro: {e.response.text}")
        
        try:
            summary = controller.load_data("../esp/dados_wifi.csv")
        except Exception as e:
            raise HTTPException(500, f"Falha ao carregar dados: {e}")
    
        return summary

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