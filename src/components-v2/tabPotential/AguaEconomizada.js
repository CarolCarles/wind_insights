import React from "react";
import StatCard from "../ui/StatCard";

function AguaEconomizada({ data, raioTurbina = 40, eficiencia = 0.4 }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <StatCard title="Água Economizada">
        <p>Nenhum dado disponível para calcular a água economizada.</p>
      </StatCard>
    );
  }

  // Parâmetros para o cálculo
  const densidadeAr = 1.225; // kg/m³
  const area = Math.PI * Math.pow(raioTurbina, 2);
  const litrosPorMWh = 2000; // Exemplo: 2000 litros economizados por MWh gerado

  // Calcula energia total gerada (em Wh)
  const energiaTotal = data.reduce((total, row) => {
    const velocidade = parseFloat(row.ws100);
    if (velocidade > 4) {
      const potencia = 0.5 * densidadeAr * area * Math.pow(velocidade, 3) * eficiencia;
      const energia = potencia * (10 / 60); // energia em Wh
      return total + energia;
    }
    return total;
  }, 0);

  const energiaTotalMWh = energiaTotal / 1_000_000; // converte Wh para MWh
  const aguaEconomizada = energiaTotalMWh * litrosPorMWh;

  return (
    <StatCard
      title="Água Economizada"
      iconLabel="Gota d'água"
      icon={
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#00bfff">
          <path d="M12 2.69l-.72.69C7.1 7.09 4 11.05 4 14.5 4 18.09 7.13 21 12 21s8-2.91 8-6.5c0-3.45-3.1-7.41-7.28-11.12L12 2.69z" />
        </svg>
      }
    >
      <p>
        Total de água economizada:{" "}
        {aguaEconomizada.toLocaleString(undefined, { maximumFractionDigits: 0 })} litros
      </p>
    </StatCard>
  );
}

export default AguaEconomizada;