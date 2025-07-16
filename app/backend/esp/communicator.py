import os
import time
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from model.model import Summary

from database.database import SessionLocal
from database.models import RocketLaunch, RocketTelemetry, RocketTelemetryAnalysis

# Redirecionamento local seguro (se necessário)
try:
    engine_url = SessionLocal.kw["bind"].url.render_as_string(hide_password=False)
    if "postgres:5432" in engine_url:
        print("[INFO] Redirecionando conexão para postgres:5432 para uso local.")
        LOCAL_DB_URL = "postgresql+psycopg2://p1user:p1password@postgres:5432/analytics"
        engine = create_engine(LOCAL_DB_URL, echo=True)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    print(f"[WARN] Falha ao checar ou substituir URL do banco: {e}")


def get_next_launch_id(session: Session) -> int:
    last_id = session.query(RocketLaunch.id).order_by(RocketLaunch.id.desc()).first()
    return (last_id[0] if last_id else 0) + 1


def sync_sequence(session: Session, table: str, sequence: str) -> None:
    session.execute(text(f"""
        SELECT setval('{sequence}', COALESCE((SELECT MAX(id) FROM {table}), 1), true)
    """))


def insert_full_telemetry(csv_path: str) -> None:
    # -----------------------------------------------------------------------
    # 2.1 Carrega CSV e garante tipos corretos
    # -----------------------------------------------------------------------
    df = pd.read_csv(csv_path, parse_dates=["time"])

    # Converte colunas numéricas (exceto 'time') para float
    for col in df.columns:
        if col != "time":
            df[col] = pd.to_numeric(df[col], errors="coerce")

    base_time = datetime.now()

    with SessionLocal() as session:
        # -------------------------------------------------------------------
        # 2.2 Cria novo lançamento com ID manual
        # -------------------------------------------------------------------
        launch_id = get_next_launch_id(session)
        launch = RocketLaunch(id=launch_id, launch_date=base_time)
        session.add(launch)
        session.flush()  # garante que launch_id seja válido

        # -------------------------------------------------------------------
        # 2.3 Bulk-insert dos pontos de telemetria
        # -------------------------------------------------------------------
        telemetry_rows = [
            {
                "launch_id": launch_id,
                "timestamp": pd.to_datetime(row["time"]),
                "latitude": float(row["lat"]),
                "longitude": float(row["lng"]),
                "altitude_meters": float(row["alt"]),
                "gyro_x": float(row["gx"]),
                "gyro_y": float(row["gy"]),
                "gyro_z": float(row["gz"]),
                "speed_mps": float(row["vel"]),
            }
            for _, row in df.iterrows()
        ]
        session.bulk_insert_mappings(RocketTelemetry, telemetry_rows)

        # -------------------------------------------------------------------
        # 2.4 Calcula resumo e insere
        # -------------------------------------------------------------------
        analysis = RocketTelemetryAnalysis(
            launch_id=launch_id,
            avg_altitude=float(df["alt"].mean()),
            max_altitude=float(df["alt"].max()),
            min_altitude=float(df["alt"].min()),
            avg_speed=float(df["vel"].mean()),
            max_speed=float(df["vel"].max()),
            min_speed=float(df["vel"].min()),
            total_duration_seconds=(df["time"].iloc[-1] - df["time"].iloc[0]).total_seconds(),
            recorded_points=len(df),
        )
        session.add(analysis)

        # -------------------------------------------------------------------
        # 2.5 Commit, sincroniza sequência e fim
        # -------------------------------------------------------------------
        session.commit()
        sync_sequence(session, "rocket_launch", "rocket_launch_id_seq")
        sync_sequence(session, "rocket_telemetry_analysis", "rocket_telemetry_analysis_id_seq")
        session.commit()

        print(f"[OK] Lançamento {launch_id} salvo com {len(df)} pontos de telemetria.")


if __name__ == "__main__":
    print("[INFO] Iniciando watcher de telemetria...")
    while True:
        CURRENT_DIR = os.path.dirname(__file__)
        CSV_PATH = os.path.join(CURRENT_DIR, "dados_wifi.csv")
        if os.path.exists(CSV_PATH):
            try:
                print(f"[INFO] CSV encontrado. Processando: {CSV_PATH}")
                insert_full_telemetry(CSV_PATH)
                os.remove(CSV_PATH)
                print("[INFO] Arquivo processado e removido com sucesso.")
            except Exception as e:
                print(f"[ERRO] Falha ao processar {CSV_PATH}: {e}")
        else:
            print("[INFO] Nenhum CSV encontrado. Aguardando...")

        time.sleep(1)