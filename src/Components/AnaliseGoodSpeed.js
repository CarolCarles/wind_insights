import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import "../Styles/analise.css";

function AnaliseGoodSpeed({ data, limiteVelocidade = 4 }) {
  const [chartOptions, setChartOptions] = useState(null);
  const [totalTime, setTotalTime] = useState(0);

  useEffect(() => {
    if (!Array.isArray(data) || data.length === 0) {
      setChartOptions(null);
      setTotalTime(0);
      return;
    }

    const filteredData = data.filter((row) => parseFloat(row.ws100) > limiteVelocidade);
    const totalMinutes = filteredData.length * 10;
    const totalHours = totalMinutes / 60;
    const totalDays = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    const formattedTotalTime = `${totalDays} dias e ${remainingHours.toFixed(2)} horas`;
    setTotalTime(formattedTotalTime);

    const groupedData = filteredData.reduce((acc, row) => {
      const dateValue = new Date(row.id);
      if (isNaN(dateValue.getTime())) return acc;
      const date = dateValue.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 10;
      return acc;
    }, {});

    const chartData = Object.entries(groupedData).map(([date, time]) => ({
      date,
      time: time / 60,
    }));

    setChartOptions({
      chart: { type: "column", zoomType: "x" },
      title: { text: `   ` },
      xAxis: {
        categories: chartData.map((item) => item.date),
        title: { text: "Data" },
      },
      yAxis: {
        min: 0,
        title: { text: "Horas" },
      },
      series: [
        {
          name: `Tempo com velocidade > ${limiteVelocidade} m/s`,
          data: chartData.map((item) => item.time),
          color: "rgba(2, 19, 6, 0.6)",
        },
      ],
    });
  }, [data, limiteVelocidade]);

  return (
    <div className="analisegoodspeed-container" style={{
      background: "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 12px #e3e9f7",
      padding: 20,
      marginBottom: 24,
      minWidth: 260,
      // Removido maxWidth e margin: "0 auto" para manter a largura padrão anterior
    }}>
      <h2 style={{
        color: "#0742e6",
        fontWeight: 700,
        fontSize: 20,
        marginBottom: 10,
        letterSpacing: "0.5px"
      }}>
        Tempo por Dia com Velocidade maior que {limiteVelocidade} m/s
      </h2>
      
      <p style={{
        fontSize: 16,
        color: "#222",
        marginBottom: 12,
        fontWeight: 500
      }}>
        <span style={{ color: "#1a237e" }}>
          Tempo total com velocidade maior que {limiteVelocidade} m/s =
        </span>{" "}
        <b style={{ color: "#0742e6" }}>{totalTime}</b>
      </p>
      <div
                style={{
                    background: "#f7faff",
                    border: "1px solid #b3c8f9",
                    borderRadius: 8,
                    padding: "10px 16px",
                    marginBottom: 12,
                    color: "#0742e6",
                    fontSize: 15,
                    marginLeft: "auto",      // Faz a caixa ir para a direita
                    textAlign: "right",      // Alinha o texto à direita
                    width: "fit-content"     // Só ocupa o necessário
                }}
            >
                <b>Dica:</b> Passe o mouse sobre o gráfico para ver os valores de cada ponto.<br />
                Selecione uma área do gráfico para dar zoom.<br />
                Clique em "Reset Zoom" para voltar à visualização completa.
            </div>
      {chartOptions ? (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      ) : (
        <p style={{ color: "#888", fontSize: 15, marginTop: 18 }}>
          Nenhum dado disponível para velocidades acima de {limiteVelocidade} m/s.
        </p>
      )}
    </div>
  );
}

export default AnaliseGoodSpeed;

