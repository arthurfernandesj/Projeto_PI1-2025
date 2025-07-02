import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Grid, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

function HomePage() {
  const [launches, setLaunches] = useState([]);
  const API_URL = "http://localhost:8000";

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        const endpoint = `${API_URL}/api/telemetry/launchs/`;
        console.log("Fetching launches from:", endpoint);
        const response = await fetch(endpoint);
        console.log("Response status:", response.status);

        const data = await response.json();
        console.log("Received data:", data);

        if (Array.isArray(data)) {
          setLaunches(data);
        } else {
          console.error("Esperado um array, recebido:", data);
          setLaunches([]);
        }
      } catch (error) {
        console.error("Erro ao buscar lançamentos:", error);
        setLaunches([]);
      }
    };

    fetchLaunches();
  }, [API_URL]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => fetch("http://192.168.4.1/iniciar").catch(console.error)}
        >
          Iniciar
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => fetch("http://192.168.4.1/parar").catch(console.error)}
        >
          Parar
        </Button>
      </Box>
      <Typography variant="h3" component="h1" gutterBottom>
        Lançamentos de Foguetes
      </Typography>
      <Grid container spacing={3}>
        {launches.map((launch) => (
          <Grid item xs={12} sm={6} md={4} key={launch.launch_id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Lançamento #{launch.launch_id}
                </Typography>
                {launch.timestamp && (
                  <Typography color="textSecondary">
                    Data: {new Date(launch.timestamp).toLocaleDateString()}
                  </Typography>
                )}
                <Button
                  component={Link}
                  to={`/launch/${launch.launch_id}`}
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Ver Detalhes
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default HomePage;