import React, { useState, useEffect, useCallback } from "react";
import { Box, Card, CardContent, Grid, Typography, Button, Container, Pagination, Stack, Paper } from "@mui/material";
import { Link } from "react-router-dom";

function HomePage() {
  const [launches, setLaunches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
  const pageSize = 9;

  const fetchLaunches = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = `${API_URL}/api/launches/?page=${currentPage}&page_size=${pageSize}`;
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data && Array.isArray(data.launches)) {
        setLaunches(data.launches);
        setTotalPages(data.total_pages);
        setTotalCount(data.total_count);
      } else {
        setLaunches([]);
      }
    } catch (error) {
      console.error("Erro ao buscar lançamentos:", error);
      setLaunches([]);
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentPage, pageSize]);

  const fetchStatistics = useCallback(async () => {
    try {
      const response = await fetch(`${API_URL}/api/statistics/general`);
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  }, [API_URL]);

  const handleStop = async () => {
    try {
      const res = await fetch(`${API_URL}/api/data/load`);
      if (!res.ok) throw new Error(await res.text());
      await res.json();
      // Reload data lists after successful import
      await fetchLaunches();
      await fetchStatistics();
    } catch (err) {
      console.error("Erro ao parar e carregar dados:", err);
    }
  };

  useEffect(() => {
    fetchLaunches();
    fetchStatistics();
  }, [fetchLaunches, fetchStatistics]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const infoBoxStyle = {
    background: "#f0f4f8",
    padding: "20px 25px",
    borderRadius: 8,
    textAlign: "center",
    boxShadow: "0 1px 5px rgba(0,0,0,0.1)",
    minWidth: 150,
  };

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
          onClick={handleStop}
        >
          Parar
        </Button>
      </Box>

      <Typography variant="h3" component="h1" gutterBottom>
        Lançamentos de Foguetes
      </Typography>

      {/* Estatísticas Gerais */}
      {statistics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Altitude Média</Typography>
              <Typography variant="h4">{statistics.average_altitude}m</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Velocidade Média</Typography>
              <Typography variant="h4">{statistics.average_speed}m/s</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={infoBoxStyle}>
              <Typography variant="h6">Duração Média</Typography>
              <Typography variant="h4">{statistics.average_duration}s</Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      {totalCount > 0 && (
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Mostrando {launches.length} de {totalCount} lançamentos (Página {currentPage} de {totalPages})
        </Typography>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Carregando lançamentos...</Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {launches.map((launch) => (
              <Grid item xs={12} sm={6} md={4} key={launch.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" component="h2">
                      Lançamento #{launch.id}
                    </Typography>
                    {launch.launch_date && (
                      <Typography color="textSecondary">
                        Data: {new Date(launch.launch_date).toLocaleString('pt-BR')}
                      </Typography>
                    )}
                    <Button
                      component={Link}
                      to={`/launch/${launch.id}`}
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

          {totalPages > 1 && (
            <Stack spacing={2} sx={{ mt: 4, alignItems: 'center' }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </>
      )}
    </Container>
  );
}

export default HomePage;