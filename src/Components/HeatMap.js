import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Heatmap from "highcharts/modules/heatmap";
import Exporting from "highcharts/modules/exporting";

// Ativar os módulos Heatmap e Exporting
if (typeof Heatmap === "function") {
  Heatmap(Highcharts);
}
if (typeof Exporting === "function") {
  Exporting(Highcharts);
}

const HeatMap = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [minSpeed, setMinSpeed] = useState(2); // Velocidade mínima padrão
  const [maxSpeed, setMaxSpeed] = useState(15); // Velocidade máxima padrão

  useEffect(() => {
    if (data && Array.isArray(data)) {
      console.log("Dados recebidos:", data);

      // Calcular os valores mínimos e máximos dinamicamente
      const speeds = data
        .map((row) => parseFloat(row.ws100))
        .filter((speed) => !isNaN(speed));
      const calculatedMinSpeed = Math.min(...speeds);
      const calculatedMaxSpeed = Math.max(...speeds);

      setMinSpeed(calculatedMinSpeed);
      setMaxSpeed(calculatedMaxSpeed);

      // Processar os dados para o gráfico
      const formattedData = data
        .map((row) => {
          if (!row || !row.id || !row.ws100) {
            console.warn("Linha inválida encontrada e ignorada:", row);
            return null;
          }

          const dateTime = row.id.split(" ");
          if (dateTime.length < 2) {
            console.warn("Formato inválido de 'id':", row.id);
            return null;
          }

          const date = dateTime[0];
          const time = dateTime[1];
          const hour = parseInt(time.split(":")[0], 10);
          const speed = parseFloat(row.ws100);

          if (!date || isNaN(hour) || isNaN(speed)) {
            console.warn("Dados inválidos encontrados:", row);
            return null;
          }

          const x = new Date(date).getTime();
          const y = hour;
          return [x, y, speed];
        })
        .filter((point) => point !== null);

      console.log("Dados formatados para o gráfico:", formattedData);
      setChartData(formattedData);
    }
  }, [data]);

  const options = {
    chart: {
      type: "heatmap",
      plotBorderWidth: 1,
      boost: {
        useGPUTranslations: true, // Melhorar o desempenho para grandes conjuntos de dados
      },
    },
    title: {
      text: "Heatmap de Velocidade",
      align: "center",
      x: 40,
    },
    subtitle: {
      text: "Variação de velocidade do vento ao longo do tempo",
      align: "center",
      x: 40,
    },
    xAxis: {
      type: "datetime",
      labels: {
        align: "left",
        x: 5,
        y: 14,
        format: "{value:%B}", // Nome do mês
      },
      showLastLabel: false,
      tickLength: 16,
    },
    yAxis: {
      title: {
        text: "Horas do Dia",
      },
      labels: {
        format: "{value}:00",
      },
      minPadding: 0,
      maxPadding: 0,
      startOnTick: false,
      endOnTick: false,
      tickPositions: [0, 6, 12, 18, 24],
      tickWidth: 1,
      min: 0,
      max: 23,
      reversed: true,
    },
    colorAxis: {
      stops: [
        [0, "#3060cf"], // Azul para velocidades mais baixas
        [0.25, "#80aaff"], // Azul claro para velocidades baixas-médias
        [0.5, "#fffbbc"], // Amarelo para velocidades médias
        [0.75, "#ff7f50"], // Laranja para velocidades altas
        [1, "#c4463a"], // Vermelho para velocidades mais altas
      ],
      min: minSpeed, // Velocidade mínima dinâmica
      max: maxSpeed, // Velocidade máxima dinâmica
      startOnTick: false,
      endOnTick: false,
      labels: {
        format: "{value} m/s",
      },
    },
    series: [
      {
        name: "Velocidade do Vento",
        borderWidth: 0,
        nullColor: "#EFEFEF",
        colsize: 24 * 36e5, // Um dia em milissegundos
        data: chartData,
        tooltip: {
          headerFormat: "<b>Velocidade do Vento</b><br/>",
          pointFormat:
            "Data: {point.x:%e %b, %Y}<br/>Hora: {point.y}:00<br/>Velocidade: <b>{point.value} m/s</b>",
        },
      },
    ],
  };

  return (
    <div>
      {chartData.length > 0 ? (
        <HighchartsReact highcharts={Highcharts} options={options} />
      ) : (
        <p>Nenhum dado disponível para exibir no gráfico.</p>
      )}
    </div>
  );
};

export default HeatMap;
//   );
// };

// export default HeatMap;

// cuidado

