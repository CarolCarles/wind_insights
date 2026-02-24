import React from "react";

function CasasAbastecidas({ data, raioTurbina = 40, eficiencia = 0.4 }) {
  // Verifica se os dados são válidos
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div>
        <h1>Casas Abastecidas</h1>
        <p>Nenhum dado disponível para calcular as casas abastecidas.</p>
      </div>
    );
  }

  const densidadeAr = 1.225; // kg/m³
  const area = Math.PI * Math.pow(raioTurbina, 2); // Área varrida pelas pás
  const consumoPorCasa = 300; // Consumo médio mensal por casa em kWh (exemplo)

  // Calcula a energia total gerada
  const energiaTotal = data.reduce((total, row) => {
    const velocidade = parseFloat(row.ws100);
    if (velocidade > 4) { // Considera apenas velocidades acima de 4 m/s
      const potencia = 0.5 * densidadeAr * area * Math.pow(velocidade, 3) * eficiencia; // Potência em watts
      const energia = potencia * (10 / 60); // Energia gerada em 10 minutos (convertido para horas)
      return total + energia;
    }
    return total;
  }, 0);

  // Converte energia total para kWh
  const energiaTotalKWh = energiaTotal / 1000;

  // Calcula o número de casas abastecidas
  const casasAbastecidas = energiaTotalKWh / consumoPorCasa;

  return (
    <div className="casas-abastecidas">
      <div style={{ display: "flex", alignItems: "center" }}>
        <span style={{ fontSize: "2rem", marginRight: "10px" }} role="img" aria-label="Casa">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="#0742e6"><path d="M12 3l10 9h-3v9h-6v-6h-2v6H5v-9H2z"/></svg>
        </span>
        <h1>Casas Abastecidas</h1>
      </div>
      <div className="casas-abastecidas-container">
        <div className="casas-abastecidas-text">
          <p>Total de energia gerada: {energiaTotalKWh.toFixed(2)} kWh</p>
          <p>Total de casas abastecidas: {casasAbastecidas.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
}

export default CasasAbastecidas;