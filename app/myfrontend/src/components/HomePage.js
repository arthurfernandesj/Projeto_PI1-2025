import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Grid, Typography, Button, Container, Pagination, Stack } from "@mui/material";
import { Link } from "react-router-dom";

function HomePage() {
  const [launches, setLaunches] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
  const pageSize = 9;

  const handleStop = async () => {
    try {
      const res = await fetch(`${API_URL}/api/data/load`);
      if (!res.ok) throw new Error(await res.text());
      const summary = await res.json();
      console.log("Resumo recebido:", summary);
    } catch (err) {
      console.error("Erro ao parar e carregar dados:", err);
    }
  };
  
  useEffect(() => {
    const fetchLaunches = async () => {
      setLoading(true);
      try {
        const endpoint = `${API_URL}/api/launches/?page=${currentPage}&page_size=${pageSize}`;
        console.log("Fetching launches from:", endpoint);
        const response = await fetch(endpoint);
        console.log("Response status:", response.status);

        const data = await response.json();
        console.log("Received data:", data);

        if (data && data.launches && Array.isArray(data.launches)) {
          setLaunches(data.launches);
          setTotalPages(data.total_pages);
          setTotalCount(data.total_count);
        } else {
          console.error("Formato de dados inesperado:", data);
          setLaunches([]);
        }
      } catch (error) {
        console.error("Erro ao buscar lançamentos:", error);
        setLaunches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLaunches();
  }, [API_URL, currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      </Box>      <Typography variant="h3" component="h1" gutterBottom>
        Lançamentos de Foguetes
      </Typography>
      
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