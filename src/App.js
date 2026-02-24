import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CSVReader from "./Components/CSVReader";
import Analise from "./Components/Analise"; // Importe o componente Analise


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CSVReader />} />
        <Route path="/analise" element={<Analise />} /> {/* Define a rota para a página Analise */}
      </Routes>
    </Router>
  );
}

export default App;