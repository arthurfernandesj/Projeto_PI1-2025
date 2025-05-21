import React, { useEffect, useState } from "react";

function RealTimeTelemetry() {
  const [telemetryData, setTelemetryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = () => {
      fetch("http://localhost:8000/api/telemetry/launch/1")
        .then((res) => res.json())
        .then((data) => {
          setTelemetryData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erro:", err);
          setLoading(false);
        });
    };

    fetchData(); // fetch inicial
    const intervalId = setInterval(fetchData, 100); // polling 5s

    return () => clearInterval(intervalId);
  }, []);

  if (loading) return <div>Carregando dados...</div>;
  if (!telemetryData) return <div>Sem dados</div>;

  return (
    <div>
      <h3>Dados Telemetria (Atualização em tempo real)</h3>
      <ul>
        <li>Altitude: {telemetryData.altitude}</li>
        <li>Velocidade: {telemetryData.speed}</li>
        <li>Temperatura: {telemetryData.temperature}</li>
      </ul>
    </div>
  );
}

export default RealTimeTelemetry;