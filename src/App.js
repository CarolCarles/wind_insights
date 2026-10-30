import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const WindRoseMapPage = lazy(() => import("./components/tabMain/WindRoseMapPage"));
const DashboardPageV2 = lazy(() => import("./components/DashboardPage"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div style={{ padding: 24 }}>Carregando...</div>}>
        <Routes>
          <Route path="/" element={<DashboardPageV2 />} />
          <Route path="/wind-rose-map" element={<WindRoseMapPage />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;