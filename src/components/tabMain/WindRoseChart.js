import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";

import Button from "../ui/Button";
import { processWindRoseData } from "./WindRoseUtils";

if (typeof HighchartsMore === "function") {
  HighchartsMore(Highcharts);
}

const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const SERIES_NAMES = ["2-4 m/s", "4-6 m/s", "6-8 m/s", "8-10 m/s", "10-12 m/s", ">12 m/s"];
const COLORS = ["#CAF0F8", "#90E0EF", "#84CAE4", "#0096C7", "#023E8A", "#03045E"];

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
    <div className="relative w-full">
      {onOpenMap && (
        <Button
          size="sm"
          className="absolute left-2.5 top-2.5 z-10"
          onClick={onOpenMap}
          disabled={mapDisabled}
        >
          Ver no mapa
        </Button>
      )}
      <HighchartsReact highcharts={Highcharts} options={options} containerProps={{ style: { width: "100%" } }} />
    </div>
  );
};

export default WindRoseChart;