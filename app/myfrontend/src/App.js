import React, { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";

function App() {
  const [telemetry, setTelemetry] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const launchId = 1;

  const fetching = useRef(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        const [telemetryRes, summaryRes] = await Promise.all([
          fetch(`${API_URL}/api/telemetry/launch/${launchId}`),
          fetch(`${API_URL}/api/telemetry/summary/${launchId}`),
        ]);

        if (!isMounted) return;
        if (!telemetryRes.ok || !summaryRes.ok) throw new Error("Fetch failed");

        const telemetryData = await telemetryRes.json();
        const summaryData = await summaryRes.json();

        setTelemetry(telemetryData);
        setSummary(summaryData);
        setLoading(false);

        console.log("Dados atualizados", new Date().toLocaleTimeString());
      } catch (error) {
        if (!isMounted) return;
        console.error("Erro ao buscar dados:", error);
        setTelemetry([]);
        setSummary(null);
        setLoading(false);
      } finally {
        fetching.current = false;
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 100);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [launchId, API_URL]);

  if (loading) return <div style={{ padding: 20 }}>Carregando dados...</div>;
  if (!telemetry.length || !summary) return <div style={{ padding: 20 }}>Sem dados disponíveis</div>;

  const timestamps = telemetry.map((d) => d.timestamp);
  const altitude = telemetry.map((d) => d.altitude_meters);
  const speed = telemetry.map((d) => d.speed_mps);
  const gyroX = telemetry.map((d) => d.gyro_x);
  const gyroY = telemetry.map((d) => d.gyro_y);
  const gyroZ = telemetry.map((d) => d.gyro_z);
  const latitude = telemetry.map((d) => d.latitude);
  const longitude = telemetry.map((d) => d.longitude);

  const infoBoxStyle = {
    background: "#f0f4f8",
    padding: "20px 25px",
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
    minWidth: 150,
  };

  return (
    <div
      style={{
        maxWidth: 1200,
        margin: "auto",
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>Lançamento de Foguete - Análise de Telemetria (Atualização em tempo real)</h1>

      <section
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: 30,
        }}
      >
        <div style={infoBoxStyle}>
          <h3>Altitude Máxima</h3>
          <p>{summary.max_altitude.toFixed(2)} m</p>
        </div>
        <div style={infoBoxStyle}>
          <h3>Duração Total</h3>
          <p>{summary.total_duration_seconds} segundos</p>
        </div>
        <div style={infoBoxStyle}>
          <h3>Pontos Registrados</h3>
          <p>{summary.recorded_points}</p>
        </div>
        <div style={infoBoxStyle}>
          <h3>Velocidade Máxima</h3>
          <p>{summary.max_speed?.toFixed(2) ?? "N/A"} m/s</p>
        </div>
      </section>

      <Plot
        data={[
          {
            x: timestamps,
            y: altitude,
            type: "scatter",
            mode: "lines+markers",
            marker: { color: "royalblue" },
            name: "Altitude (m)",
          },
        ]}
        layout={{ title: "Altitude vs Tempo", height: 350 }}
      />

      <Plot
        data={[
          {
            x: timestamps,
            y: speed,
            type: "scatter",
            mode: "lines",
            marker: { color: "firebrick" },
            name: "Velocidade (m/s)",
          },
        ]}
        layout={{ title: "Velocidade vs Tempo", height: 350 }}
      />

      <Plot
        data={[
          {
            x: timestamps,
            y: gyroX,
            type: "scatter",
            mode: "lines",
            name: "Giroscópio X",
            line: { color: "green" },
          },
          {
            x: timestamps,
            y: gyroY,
            type: "scatter",
            mode: "lines",
            name: "Giroscópio Y",
            line: { color: "blue", dash: "dash" },
          },
          {
            x: timestamps,
            y: gyroZ,
            type: "scatter",
            mode: "lines",
            name: "Giroscópio Z",
            line: { color: "purple", dash: "dot" },
          },
        ]}
        layout={{ title: "Giroscópio vs Tempo", height: 350 }}
      />

      <Plot
        data={[
          {
            type: "scattergeo",
            mode: "lines+markers",
            lon: longitude,
            lat: latitude,
            marker: { size: 6, color: "darkcyan" },
            line: { color: "darkcyan" },
            name: "Trajetória GPS",
          },
        ]}
        layout={{
          title: "Trajetória GPS (Latitude x Longitude)",
          geo: {
            projection: { type: "orthographic" },
            showland: true,
            landcolor: "rgb(243, 243, 243)",
            oceancolor: "rgb(204, 224, 255)",
            showcountries: true,
            countrycolor: "rgb(204, 204, 204)",
          },
          height: 500,
        }}
      />
    </div>
  );
}

export default App;