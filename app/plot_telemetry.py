import os
from sqlalchemy import create_engine, text
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from dotenv import load_dotenv

load_dotenv()

POSTGRES_USER = os.getenv("POSTGRES_USER")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD")
POSTGRES_DB = os.getenv("POSTGRES_DB")
POSTGRES_PORT = os.getenv("POSTGRES_PORT")

if not all([POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB, POSTGRES_PORT]):
    raise ValueError("Alguma variável do banco não está configurada no .env")

DATABASE_URL = f"postgresql+psycopg2://{POSTGRES_USER}:{POSTGRES_PASSWORD}@localhost:{POSTGRES_PORT}/{POSTGRES_DB}"
print("Connecting to DB with URL:", DATABASE_URL)

engine = create_engine(DATABASE_URL)


def fetch_telemetry(launch_id):
    query = text("""
        SELECT timestamp, latitude, longitude, altitude_meters, gyro_x, gyro_y, gyro_z, speed_mps
        FROM rocket_telemetry
        WHERE launch_id = :launch_id
        ORDER BY timestamp
    """)
    with engine.connect() as conn:
        df = pd.read_sql(query, conn, params={"launch_id": launch_id})
    return df


def plot_telemetry(df):
    fig = make_subplots(
        rows=3, cols=2,
        subplot_titles=(
            "Altitude vs Tempo",
            "Velocidade vs Tempo",
            "Giroscópio (X, Y, Z) vs Tempo",
            "Trajetória GPS (Latitude x Longitude)",
            "Altitude com Marcadores"
        ),
        specs=[[{"type": "scatter"}, {"type": "scatter"}],
               [{"type": "scatter"}, {"type": "scatter"}],
               [{"colspan": 2, "type": "scattergeo"}, None]],
        vertical_spacing=0.12,
        horizontal_spacing=0.15,
    )

    # Altitude vs Tempo
    fig.add_trace(go.Scatter(x=df['timestamp'], y=df['altitude_meters'],
                             mode='lines+markers', name='Altitude (m)',
                             line=dict(color='royalblue')), row=1, col=1)

    # Velocidade vs Tempo
    fig.add_trace(go.Scatter(x=df['timestamp'], y=df['speed_mps'],
                             mode='lines', name='Velocidade (m/s)',
                             line=dict(color='firebrick')), row=1, col=2)

    # Giroscópio X,Y,Z vs Tempo
    fig.add_trace(go.Scatter(x=df['timestamp'], y=df['gyro_x'],
                             mode='lines', name='Giro X',
                             line=dict(color='green')), row=2, col=2)
    fig.add_trace(go.Scatter(x=df['timestamp'], y=df['gyro_y'],
                             mode='lines', name='Giro Y',
                             line=dict(color='blue', dash='dash')), row=2, col=2)
    fig.add_trace(go.Scatter(x=df['timestamp'], y=df['gyro_z'],
                             mode='lines', name='Giro Z',
                             line=dict(color='purple', dash='dot')), row=2, col=2)

    # Trajetória GPS no mapa (latitude x longitude)
    fig.add_trace(go.Scattergeo(
        lon=df['longitude'],
        lat=df['latitude'],
        mode='lines+markers',
        marker=dict(size=6, color='darkcyan'),
        line=dict(color='darkcyan'),
        name='Trajetória GPS'),
        row=3, col=1)

    # Altitude com marcadores e linha para destacar pontos importantes
    fig.add_trace(go.Scatter(x=df['timestamp'], y=df['altitude_meters'],
                             mode='markers+lines',
                             marker=dict(size=8, color='mediumvioletred'),
                             name='Altitude Detalhada'), row=1, col=1)

    # Layout geral
    fig.update_layout(
        height=900, width=1000,
        title_text="Análise Completa da Telemetria do Lançamento",
        legend=dict(x=0.85, y=0.95),
        margin=dict(l=50, r=50, t=80, b=50),
        hovermode='x unified'
    )

    # Ajuste mapa para centralizar no meio dos pontos GPS
    center_lat = df['latitude'].mean()
    center_lon = df['longitude'].mean()

    fig.update_geos(
        showcountries=True, countrycolor="RebeccaPurple",
        showsubunits=True,
        lataxis_range=[df['latitude'].min()-0.01, df['latitude'].max()+0.01],
        lonaxis_range=[df['longitude'].min()-0.01, df['longitude'].max()+0.01],
        center=dict(lat=center_lat, lon=center_lon),
        projection_type='orthographic',
        row=3, col=1
    )

    fig.show()


def main():
    launch_id = 1
    df = fetch_telemetry(launch_id)
    if df.empty:
        print("Nenhum dado encontrado para esse launch_id")
        return

    plot_telemetry(df)


if __name__ == "__main__":
    main()