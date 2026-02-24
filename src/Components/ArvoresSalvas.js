import React from "react";

function ArvoresSalvas({ data, raioTurbina = 40, eficiencia = 0.4 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div>
        <h1>Árvores Salvas</h1>
        <p>Nenhum dado disponível para calcular as árvores salvas.</p>
      </div>
    );
  }

  const densidadeAr = 1.225; // kg/m³
  const area = Math.PI * Math.pow(raioTurbina, 2);
  const kWhPorArvore = 500; // 1 árvore salva a cada 500 kWh

  // Calcula energia total gerada
  const energiaTotal = data.reduce((total, row) => {
    const velocidade = parseFloat(row.ws100);
    if (velocidade > 4) {
      const potencia = 0.5 * densidadeAr * area * Math.pow(velocidade, 3) * eficiencia;
      const energia = potencia * (10 / 60); // energia em Wh
      return total + energia;
    }
    return total;
  }, 0);

  const energiaTotalKWh = energiaTotal / 1000;
  const arvoresSalvas = energiaTotalKWh / kWhPorArvore;

  return (
    <div className="arvores-salvas">
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "2rem", marginRight: "10px" }} role="img" aria-label="Árvore">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#2ecc40"><path d="M12 2C10.07 2 8.5 3.57 8.5 5.5c0 .62.16 1.2.44 1.7C6.5 7.5 5 9.24 5 11.25c0 1.38.56 2.63 1.46 3.54C6.18 15.37 6 15.67 6 16c0 .55.45 1 1 1h2v3h2v-3h2c.55 0 1-.45 1-1 0-.33-.18-.63-.46-.79.9-.91 1.46-2.16 1.46-3.54 0-2.01-1.5-3.75-3.94-4.05.28-.5.44-1.08.44-1.7C15.5 3.57 13.93 2 12 2z"/></svg>
        </span>
        <h1>Árvores Salvas</h1>
      </div>
      <div className="arvores-salvas-container">
        <div className="arvores-salvas-text">
          <p>Total de árvores salvas: {arvoresSalvas.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}

export default ArvoresSalvas;