import csv
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv


load_dotenv()


ESP_CONNECTION = os.getenv("ESP_URL")
URL = f"{ESP_CONNECTION}/dados"

# Caminho do CSV que será consumido pelo backend
CSV_PATH = Path(__file__).parent / "dados_wifi.csv"
HEADER = [
    "lat",
    "lng",
    "alt",
    "vel",
    "gx",
    "gy",
    "gz",
    "ax",
    "ay",
    "az",
    "time",
]


def append_row(row_values):
    """Abre o CSV em modo append e grava *row_values*.
    Escreve o cabeçalho se o arquivo acabou de ser criado ou está vazio."""

    need_header = not CSV_PATH.exists() or CSV_PATH.stat().st_size == 0
    with CSV_PATH.open("a", newline="", encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)
        if need_header:
            writer.writerow(HEADER)
        writer.writerow(row_values)


print("Conectado ao ESP32 via Wi-Fi. Coletando dados...")

try:
    while True:
        try:
            response = requests.get(URL, timeout=2)
            linha = response.text.strip()
            if linha.startswith("invalid"):
                print("Aguardando fix do GPS...")
                time.sleep(1)
                continue

            valores = linha.split(",")
            if len(valores) == 11:
                append_row(valores)
                print("Salvo:", linha)
            else:
                print("Linha inválida:", linha)
        except Exception as exc:
            print("Erro de conexão:", exc)
        time.sleep(1)
except KeyboardInterrupt:
    print("\nFinalizado pelo usuário.")