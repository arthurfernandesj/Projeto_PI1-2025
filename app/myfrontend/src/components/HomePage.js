import React, { useState, useEffect } from "react";
import { Card, CardContent, Grid, Typography, Button, Container } from "@mui/material";
import { Link } from "react-router-dom";

function HomePage() {
  const [launches, setLaunches] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchLaunches = async () => {
      try {
        console.log("Fetching launches from:", `${API_URL}/api/launches`);
        const response = await fetch(`${API_URL}/api/launches`);
        console.log("Response status:", response.status);
        const data = await response.json();
        console.log("Received data:", data);
        setLaunches(data);
      } catch (error) {
        console.error("Error fetching launches:", error);
      }
    };

    fetchLaunches();
  }, [API_URL]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Lançamentos de Foguetes
      </Typography>
      <Grid container spacing={3}>
        {launches.map((launch) => (
          <Grid item xs={12} sm={6} md={4} key={launch.id}>
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2">
                  Lançamento #{launch.id}
                </Typography>
                <Typography color="textSecondary">
                  Data: {new Date(launch.launch_date).toLocaleDateString()}
                </Typography>
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
    </Container>
  );
}

export default HomePage;