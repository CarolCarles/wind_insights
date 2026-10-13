import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CSVReader from "./components/CSVReader";
import Analise from "./components/Analise";
import WindRoseMapPage from "./components/WindRoseMapPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CSVReader />} />
        <Route path="/analise" element={<Analise />} />
        <Route path="/wind-rose-map" element={<WindRoseMapPage />} />
      </Routes>
    </Router>
  );
}

export default App;