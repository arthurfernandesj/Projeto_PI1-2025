import React, { useEffect, useState, useRef } from "react";
import Plot from "react-plotly.js";
import { useParams } from "react-router-dom";
import { Container, Typography, Box, Button, Grid, Paper } from "@mui/material";
import { Link } from "react-router-dom";

function LaunchDetails() {
  const [telemetry, setTelemetry] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const { launchId } = useParams();

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
    const intervalId = setInterval(fetchData, 5000);

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
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button component={Link} to="/" variant="outlined" sx={{ mb: 2 }}>
          Voltar para Home
        </Button>

        <Typography variant="h4" component="h1" gutterBottom>
          Lançamento #{launchId}
        </Typography>

        {/*infos*/}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Altitude Máxima</Typography>
              <Typography variant="h4">{summary?.max_altitude?.toFixed(1)}m</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Velocidade Máxima</Typography>
              <Typography variant="h4">{summary?.max_speed?.toFixed(1)}m/s</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Duração</Typography>
              <Typography variant="h4">{summary?.duration}s</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Status</Typography>
              <Typography variant="h4">{summary?.status}</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/*graficos*/}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Plot
              data={[
                {
                  x: timestamps,
                  y: altitude,
                  type: "scatter",
                  mode: "lines",
                  name: "Altitude",
                },
              ]}
              layout={{
                title: "Altitude vs Tempo",
                xaxis: { title: "Tempo" },
                yaxis: { title: "Altitude (m)" },
                height: 400,
              }}
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Plot
              data={[
                {
                  x: timestamps,
                  y: speed,
                  type: "scatter",
                  mode: "lines",
                  name: "Velocidade",
                },
              ]}
              layout={{
                title: "Velocidade vs Tempo",
                xaxis: { title: "Tempo" },
                yaxis: { title: "Velocidade (m/s)" },
                height: 400,
              }}
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Plot
              data={[
                {
                  x: timestamps,
                  y: gyroX,
                  type: "scatter",
                  mode: "lines",
                  name: "X",
                },
                {
                  x: timestamps,
                  y: gyroY,
                  type: "scatter",
                  mode: "lines",
                  name: "Y",
                },
                {
                  x: timestamps,
                  y: gyroZ,
                  type: "scatter",
                  mode: "lines",
                  name: "Z",
                },
              ]}
              layout={{
                title: "Giroscópio vs Tempo",
                xaxis: { title: "Tempo" },
                yaxis: { title: "Ângulo (graus)" },
                height: 400,
              }}
              style={{ width: "100%" }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Plot
              data={[
                {
                  lon: longitude,
                  lat: latitude,
                  type: "scattermapbox",
                  mode: "lines+markers",
                  marker: { size: 8 },
                },
              ]}
              layout={{
                title: "Trajetória",
                mapbox: {
                  style: "open-street-map",
                  center: {
                    lat: latitude[0],
                    lon: longitude[0],
                  },
                  zoom: 12,
                },
                height: 400,
              }}
              style={{ width: "100%" }}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default LaunchDetails;