import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import LaunchDetails from "./components/LaunchDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/launch/:launchId" element={<LaunchDetails />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;