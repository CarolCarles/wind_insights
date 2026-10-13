import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";
import { processWindRoseData } from "./WindRoseUtils";

if (typeof HighchartsMore === "function") {
  HighchartsMore(Highcharts);
}

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const SERIES_NAMES = ["2-4 m/s", "4-6 m/s", "6-8 m/s", "8-10 m/s", "10-12 m/s", ">12 m/s"];
const COLORS = ["#CAF0F8", "#90E0EF", "#84CAE4", "#0096C7", "#023E8A", "#03045E"];

const buttonStyle = {
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 10,
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "linear-gradient(90deg, #0742e6 60%, #1a237e 100%)",
  color: "#fff",
  fontWeight: 600,
  fontSize: 13,
  border: "none",
  borderRadius: 8,
  padding: "6px 12px",
  boxShadow: "0 2px 8px #b3c8f9",
};

const WindRoseChart = ({ data, onOpenMap, mapDisabled = false }) => {
  const chartData = useMemo(() => processWindRoseData(data), [data]);

  const options = {
    chart: { polar: true, type: "column", width: null, height: 500, reflow: true, margin: [40, 10, 40, 10] },
    title: { text: "Rosa dos Ventos" },
    pane: { size: "85%" },
    xAxis: { categories: DIRECTIONS, tickmarkPlacement: "on", lineWidth: 0 },
    yAxis: { min: 0, title: { text: "Frequência (%)" }, labels: { format: "{value}%" }, reversedStacks: false },
    tooltip: { shared: true, valueSuffix: "%" },
    plotOptions: { series: { stacking: "normal", shadow: false, groupPadding: 0, pointPlacement: "on" } },
    colors: COLORS,
    series: SERIES_NAMES.map((name, i) => ({
      name,
      data: chartData.map((row) => row[i]),
      pointPlacement: "on",
    })),
  };

  return (
    <div style={{ width: "100%", position: "relative" }}>
      {onOpenMap && (
        <button
          onClick={onOpenMap}
          disabled={mapDisabled}
          style={{
            ...buttonStyle,
            cursor: mapDisabled ? "not-allowed" : "pointer",
            opacity: mapDisabled ? 0.5 : 1,
          }}
        >
          Ver no mapa
        </button>
      )}
      <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { width: "100%" } }} />
    </div>
  );
};

export default WindRoseChart;