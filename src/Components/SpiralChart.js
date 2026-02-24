import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";

// Ativar o módulo Highcharts-more para gráficos polares
if (typeof HighchartsMore === "function") {
  HighchartsMore(Highcharts);
}

function SpiralChart({ data }) {
  const a = 1;      // Raio inicial da espiral
  const b = 0.7;    // Espaçamento entre voltas (ajuste para diminuir a escala)

  if (!data || data.length === 0) return null;

  // 1. Agrupar dados por mês
  const months = {};
  data.forEach((row) => {
    const date = new Date(row.id ?? row.Time);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!months[monthKey]) months[monthKey] = [];
    months[monthKey].push({ ...row, date });
  });

  // 2. Espiral contínua: cada ponto avança no ângulo e no raio, cada 2π (360°) é um novo mês
  let points = [];
  let monthIndex = 0;
  Object.values(months).forEach((monthData) => {
    const N = monthData.length;
    monthData.forEach((row, i) => {
      // Cada mês ocupa uma volta completa (0 a 2π)
      const angle = (i / N) * 2 * Math.PI + monthIndex * 2 * Math.PI;
      const radius = a + b * monthIndex + (b * i) / N; // Raio cresce suavemente dentro do mês
      const value = row.ws100 ?? row.Value ?? 0;
      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        colorValue: value,
        name: row.id ?? row.Time ?? "",
        value,
        month: monthIndex + 1,
      });
    });
    monthIndex++;
  });

  // Linha da espiral para visualização
  const spiralSteps = 500;
  const spiralAngles = Array.from({ length: spiralSteps }, (_, i) => (i / (spiralSteps - 1)) * monthIndex * 2 * Math.PI);
  const spiralLine = spiralAngles.map(angle => {
    const radius = a + b * (angle / (2 * Math.PI));
    return [radius * Math.cos(angle), radius * Math.sin(angle)];
  });

  // Limites para o heatmap
  const minValue = Math.min(...points.map(p => p.colorValue));
  const maxValue = Math.max(...points.map(p => p.colorValue));

  const options = {
    chart: {
      type: 'scatter',
      backgroundColor: "#fff",
      width: 600,   // Diminua para caber melhor na tela
      height: 500,  // Diminua para caber melhor na tela
    },
    title: { text: "Espiral Contínua (1 volta = 1 mês)" },
    xAxis: { title: { text: " " }, gridLineColor: "lightgray", gridLineWidth: 1 },
    yAxis: { title: { text: " " }, gridLineColor: "lightgray", gridLineWidth: 1 },
    colorAxis: {
      min: minValue,
      max: maxValue,
      stops: [
        [0, "#3060cf"], // Azul para velocidades mais baixas
        [0.25, "#80aaff"], // Azul claro para velocidades baixas-médias
        [0.5, "#fffbbc"], // Amarelo para velocidades médias
        [0.75, "#ff7f50"], // Laranja para velocidades altas
        [1, "#c4463a"],
      ],
    },
    plotOptions: {
      scatter: {
        marker: {
          symbol: 'square',
          radius: 8, // Diminua o tamanho dos pontos
        }
      }
    },
    series: [
      {
        name: "Spiral",
        type: "line",
        data: spiralLine,
        color: "white",
        lineWidth: 1,
        enableMouseTracking: false,
        marker: { enabled: false },
        showInLegend: false,
        visible: true,
      },
      {
        name: "Data Points",
        type: "scatter",
        data: points,
        colorKey: "colorValue",
        marker: { radius: 4 }, // Diminua aqui também
        dataLabels: {
          enabled: false,
          format: "{point.value:.2f}",
          style: { color: "#333", fontWeight: "bold", fontSize: "8px" },
        },
        tooltip: {
          pointFormat: "Velocidade: <b>{point.value:.2f} m/s</b><br/>Data: {point.name}<br/>Mês: {point.month}"
        }
      }
    ],
    legend: { enabled: true },
    credits: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}

export default SpiralChart;