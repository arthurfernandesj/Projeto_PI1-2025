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

  console.log("LaunchDetails - API_URL:", API_URL);
  console.log("LaunchDetails - launchId:", launchId);
  console.log("LaunchDetails - launchId type:", typeof launchId);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (fetching.current) return;
      fetching.current = true;

      try {
        console.log("Fetching data for launch:", launchId);
        const [telemetryRes, summaryRes] = await Promise.all([
          fetch(`${API_URL}/api/telemetry/launch/${launchId}`),
          fetch(`${API_URL}/api/telemetry/summary/${launchId}`),
        ]);

        console.log("Telemetry response status:", telemetryRes.status);
        console.log("Summary response status:", summaryRes.status);

        if (!isMounted) return;
        if (!telemetryRes.ok || !summaryRes.ok) {
          console.error("API request failed - Telemetry status:", telemetryRes.status, "Summary status:", summaryRes.status);
          throw new Error(`Fetch failed - Telemetry: ${telemetryRes.status}, Summary: ${summaryRes.status}`);
        }

        const telemetryData = await telemetryRes.json();
        const summaryData = await summaryRes.json();

        console.log("Telemetry data length:", telemetryData.length);
        console.log("Summary data:", summaryData);

        setTelemetry(telemetryData);
        setSummary(summaryData);
        setLoading(false);
      } catch (error) {
        if (!isMounted) return;
        console.error("Erro ao buscar dados:", error);
        console.error("Error details:", error.message);
        console.error("Error stack:", error.stack);
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

  console.log("Render check - loading:", loading);
  console.log("Render check - telemetry.length:", telemetry.length);
  console.log("Render check - summary:", summary);

  if (loading) return <div style={{ padding: 20 }}>Carregando dados...</div>;
  
  if (!telemetry.length) {
    console.log("No telemetry data available");
    return <div style={{ padding: 20 }}>Sem dados de telemetria disponíveis</div>;
  }
  
  if (!summary) {
    console.log("No summary data available");
    return <div style={{ padding: 20 }}>Sem dados de resumo disponíveis</div>;
  }  const timestamps = telemetry.map((d) => d.timestamp);
  const altitude = telemetry.map((d) => d.altitude_meters);
  const speed = telemetry.map((d) => d.speed_mps);
  const latitude = telemetry.map((d) => d.latitude);
  const longitude = telemetry.map((d) => d.longitude);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371000; //raio terra
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distances = [0]; //primeira distância é 0??
  for (let i = 1; i < telemetry.length; i++) {
    const segmentDistance = calculateDistance(
      latitude[i-1], longitude[i-1],
      latitude[i], longitude[i]
    );
    distances.push(distances[i-1] + segmentDistance);
  }  //calculo aceleração
  const acceleration = [0]; //primeira aceleração é 0??
  for (let i = 1; i < telemetry.length; i++) {
    const deltaSpeed = speed[i] - speed[i-1];
    const deltaTime = (new Date(timestamps[i]) - new Date(timestamps[i-1])) / 1000; //em segundos
    if (deltaTime > 0) {
      acceleration.push(deltaSpeed / deltaTime);
    } else {
      acceleration.push(0);
    }
  }  const accelerationBySecond = {};
  const startTime = new Date(timestamps[0]);
  
  for (let i = 0; i < telemetry.length; i++) {
    const currentTime = new Date(timestamps[i]);
    const secondFromStart = Math.floor((currentTime - startTime) / 1000);
    
    if (!accelerationBySecond[secondFromStart] || Math.abs(acceleration[i]) > Math.abs(accelerationBySecond[secondFromStart])) {
      accelerationBySecond[secondFromStart] = acceleration[i];
    }
  }
  
  const secondsArray = Object.keys(accelerationBySecond).map(Number).sort((a, b) => a - b);
  const maxAccelerationPerSecond = secondsArray.map(second => accelerationBySecond[second]);



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
          </Grid>          <Grid item xs={12} md={3}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Distância Percorrida</Typography>
              <Typography variant="h4">{distances[distances.length - 1]?.toFixed(1)}m</Typography>
            </Paper>
          </Grid>          <Grid item xs={12} md={3}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Duração</Typography>
              <Typography variant="h4">{summary?.total_duration_seconds}s</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Número de pontos registrados</Typography>
              <Typography variant="h4">{summary?.recorded_points}</Typography>
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
          </Grid>          <Grid item xs={12} md={6}>
            <Plot
              data={[
                {
                  x: distances,
                  y: altitude,
                  type: "scatter",
                  mode: "lines",
                  name: "Altitude",
                },
              ]}
              layout={{
                title: "Altitude vs Distância",
                xaxis: { title: "Distância (m)" },
                yaxis: { title: "Altitude (m)" },
                height: 400,
              }}
              style={{ width: "100%" }}
            />
          </Grid>          <Grid item xs={12} md={6}>
            <Plot
              data={[
                {
                  x: secondsArray,
                  y: maxAccelerationPerSecond,
                  type: "bar",
                  name: "Aceleração Máxima",
                  marker: {
                    color: maxAccelerationPerSecond.map(acc => acc >= 0 ? 'rgba(55, 128, 191, 0.7)' : 'rgba(219, 64, 82, 0.7)'),
                    line: {
                      color: maxAccelerationPerSecond.map(acc => acc >= 0 ? 'rgba(55, 128, 191, 1.0)' : 'rgba(219, 64, 82, 1.0)'),
                      width: 1
                    }
                  }
                },
              ]}
              layout={{
                title: "Aceleração Máxima por Segundo",
                xaxis: { 
                  title: "Tempo (segundos)",
                  tickmode: 'linear',
                  dtick: 1
                },
                yaxis: { title: "Aceleração (m/s²)" },
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
              }}              style={{ width: "100%" }}
            />
          </Grid>

        </Grid>
      </Box>
    </Container>
  );
}

export default LaunchDetails;