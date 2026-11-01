import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

import Card from "../ui/Card";
import InfoBox from "../ui/InfoBox";

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
      title: {
        text: `Tempo por Dia com Velocidade maior que ${limiteVelocidade} m/s`,
      },
      subtitle: {
        text: `Tempo total com velocidade maior que ${limiteVelocidade} m/s = ${formattedTotalTime}`,
      },
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
    <Card className="h-full">
      {/* <p className="mb-3 text-[15px] text-center font-medium text-slate-800">
        <span className="text-brand">
          Tempo total com velocidade maior que {limiteVelocidade} m/s =
        </span>{" "}
        <b className="text-brand">{totalTime}</b>
      </p> */}

      {chartOptions ? (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      ) : (
        <p className="mt-4 text-[15px] text-slate-500">
          Nenhum dado disponível para velocidades acima de {limiteVelocidade} m/s.
        </p>
      )}

      <InfoBox>
        <b>Dica:</b> Passe o mouse sobre o gráfico para ver os valores de cada ponto.
        <br />
        Selecione uma área do gráfico para dar zoom.
        <br />
        Clique em "Reset Zoom" para voltar à visualização completa.
      </InfoBox>
    </Card>
  );
}

export default AnaliseGoodSpeed;