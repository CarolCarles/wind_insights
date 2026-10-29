// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import CSVReader from "./components/CSVReader";
// import Analise from "./components/Analise";
// import WindRoseMapPage from "./components/WindRoseMapPage";

// function App() {
//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={<CSVReader />} />
//         <Route path="/analise" element={<Analise />} />
//         <Route path="/wind-rose-map" element={<WindRoseMapPage />} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// React.lazy separa cada rota em um chunk próprio. Assim o CSS global dos
// componentes originais só é carregado quando a rota original é visitada
// (importante para não vazar estilos antigos para o /v2).
const CSVReader = lazy(() => import("./components/CSVReader"));
const Analise = lazy(() => import("./components/Analise"));
const WindRoseMapPage = lazy(() => import("./components/WindRoseMapPage"));
const DashboardPageV2 = lazy(() => import("./components-v2/DashboardPage"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ padding: 24 }}>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<CSVReader />} />
          <Route path="/analise" element={<Analise />} />
          <Route path="/wind-rose-map" element={<WindRoseMapPage />} />
          <Route path="/v2" element={<DashboardPageV2 />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;