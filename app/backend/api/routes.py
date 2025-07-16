from fastapi import HTTPException, APIRouter, Query, status, Response
from typing import List
from model.model import Telemetry, Summary, Launch, LaunchesResponse
from controller import controller
import httpx
from pathlib import Path

router = APIRouter()


@router.get("/api/launches/", response_model=LaunchesResponse)
async def get_launches(
    page: int = Query(1, ge=1, description="Número da página"),
    page_size: int = Query(9, ge=1, le=50, description="Itens por página")
):
    return controller.get_launches_paginated(page, page_size)

@router.get("/api/data/load", status_code=status.HTTP_204_NO_CONTENT)
async def load_csv_data():
    print("Iniciando requisição para ESP...")

    async with httpx.AsyncClient(timeout=5.0) as client:
        try:
            resp = await client.get("http://192.168.4.1/parar")
            print(f"Resposta da ESP: {resp.status_code}")
            resp.raise_for_status()
        except httpx.RequestError as e:
            print(f"Erro ao falar com a ESP: {e}")
            raise HTTPException(502, f"Erro ao falar com a ESP: {e}")
        except httpx.HTTPStatusError as e:
            print(f"ESP retornou erro: {e.response.status_code}")
            raise HTTPException(e.response.status_code, f"ESP retornou erro: {e.response.text}")
        
        try:
            print("Carregando dados do CSV...")
            summary = controller.load_data("./esp/dados_wifi.csv")
        except Exception as e:
            print(f"Erro ao carregar CSV: {e}")
            raise HTTPException(500, f"Falha ao carregar dados: {e}")
    
        print("Dados carregados com sucesso.")
        return Response(status_code=status.HTTP_204_NO_CONTENT)


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


@router.get("/api/statistics/general")
async def get_general_statistics():
    return controller.get_general_statistics()