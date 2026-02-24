// import React, { useState, useEffect } from "react";
// import Highcharts from "highcharts";
// import HighchartsReact from "highcharts-react-official";
// import HighchartsMore from "highcharts/highcharts-more";

// // Aplicar o módulo Highcharts-more
// if (typeof HighchartsMore === "function") {
//   HighchartsMore(Highcharts);
// }

// const WindRoseChart = ({ data }) => {
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     if (data) {
//       console.log("Dados recebidos para o gráfico:", data);

//       // Direções do vento
//       const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
//       const windSpeedRanges = [2, 4, 6, 8, 10, 12, 15]; // Intervalos de velocidade do vento (m/s)

//       // Inicializar a frequência para cada direção e intervalo de velocidade
//       const frequencyData = directions.reduce((acc, direction) => {
//         acc[direction] = Array(windSpeedRanges.length).fill(0);
//         return acc;
//       }, {});

//       // Processar os dados
//       data.forEach((row) => {
//         const direction = parseFloat(row["wdir100"]);
//         const speed = parseFloat(row["ws100"]);

//         // Validar os dados
//         if (isNaN(direction) || isNaN(speed)) return;

//         // Determinar a direção
//         let directionKey = null;
//         // if (direction >= 348.75 || direction < 11.25) directionKey = "N";
//         // else if (direction >= 11.25 && direction < 33.75) directionKey = "NE";
//         // else if (direction >= 33.75 && direction < 56.25) directionKey = "E";
//         // else if (direction >= 56.25 && direction < 78.75) directionKey = "SE";
//         // else if (direction >= 78.75 && direction < 101.25) directionKey = "S";
//         // else if (direction >= 101.25 && direction < 123.75) directionKey = "SW";
//         // else if (direction >= 123.75 && direction < 146.25) directionKey = "W";
//         // else if (direction >= 146.25 && direction < 168.75) directionKey = "NW";
//         if (direction >= 337.5 || direction < 22.5) directionKey = "N";
//         else if (direction >= 22.5 && direction < 67.5) directionKey = "NE";
//         else if (direction >= 67.5 && direction < 112.5) directionKey = "E";
//         else if (direction >= 112.5 && direction < 157.5) directionKey = "SE";
//         else if (direction >= 157.5 && direction < 202.5) directionKey = "S";
//         else if (direction >= 202.5 && direction < 247.5) directionKey = "SW";
//         else if (direction >= 247.5 && direction < 292.5) directionKey = "W";
//         else if (direction >= 292.5 && direction < 337.5) directionKey = "NW";

//         // Determinar o intervalo de velocidade
//         let speedRangeIndex = -1;
//         for (let i = 0; i < windSpeedRanges.length - 1; i++) {
//           if (speed >= windSpeedRanges[i] && speed < windSpeedRanges[i + 1]) {
//             speedRangeIndex = i;
//             break;
//           }
//         }
//         if (speed >= windSpeedRanges[windSpeedRanges.length - 1]) {
//           speedRangeIndex = windSpeedRanges.length - 1;
//         }

//         // Incrementar a frequência
//         if (directionKey && speedRangeIndex !== -1) {
//           frequencyData[directionKey][speedRangeIndex]++;
//         }
//       });

//       // Calcular porcentagens
//       const formattedData = directions.map((direction) => {
//         const total = frequencyData[direction].reduce((sum, value) => sum + value, 0);
//         return frequencyData[direction].map((value) => ((value / total) * 100).toFixed(2));
//       });

//       setChartData(formattedData);
//     }
//   }, [data]);

//   const options = {
//     chart: {
//       polar: true,
//       type: "column",
//     },
//     title: {
//       text: "Rosa dos Ventos",
//     },
//     pane: {
//       size: "85%",
//     },
//     xAxis: {
//       categories: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
//       tickmarkPlacement: "on",
//       lineWidth: 0,
//     },
//     yAxis: {
//       min: 0,
//       title: {
//         text: "Frequência (%)",
//       },
//       labels: {
//         format: "{value}%",
//       },
//       reversedStacks: false,
//     },
//     tooltip: {
//       shared: true,
//       valueSuffix: "%",
//     },
//     plotOptions: {
//       series: {
//         stacking: "normal",
//         shadow: false,
//         groupPadding: 0,
//         pointPlacement: "on",
//       },
//     },
//     colors: [
//       "#CAF0F8", // 2-4 
//       "#90E0EF", // 4-6 
//       "#84CAE4", // 6-8 
//       "#0096C7", // 8-10 
//       "#023E8A", // 10-12 
//       "#03045E", // <12 
//     ],
//     series: [
//       {
//         name: "2-4 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[0])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: "4-6 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[1])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: "6-8 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[2])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: "8-10 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[3])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: "10-12 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[4])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: ">12 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[5])) : [],
//         pointPlacement: "on",
//       },
//     ],
//   };

//   return (
//     <div>
//       <HighchartsReact highcharts={Highcharts} options={options} />
//     </div>
//   );
// };

// export default WindRoseChart;


// import React, { useState, useEffect } from "react";
// import Highcharts from "highcharts";
// import HighchartsReact from "highcharts-react-official";
// import HighchartsMore from "highcharts/highcharts-more";

// // Aplicar o módulo Highcharts-more
// if (typeof HighchartsMore === "function") {
//   HighchartsMore(Highcharts);
// }

// // Função para calcular média vetorial da direção
// function mediaDirecao(direcoes, velocidades) {
//   let sumX = 0, sumY = 0;
//   for (let i = 0; i < direcoes.length; i++) {
//     const rad = (direcoes[i] * Math.PI) / 180;
//     sumX += velocidades[i] * Math.cos(rad);
//     sumY += velocidades[i] * Math.sin(rad);
//   }
//   const mediaRad = Math.atan2(sumY, sumX);
//   let mediaGraus = (mediaRad * 180) / Math.PI;
//   if (mediaGraus < 0) mediaGraus += 360;
//   return { direcao: mediaGraus };
// }

// const WindRose = ({ data }) => {
//   const [chartData, setChartData] = useState([]);

//   useEffect(() => {
//     if (!data || data.length === 0) {
//       setChartData([]);
//       return;
//     }

//     // 1. Agrupar por hora (igual ao StickPlot)
//     const agrupadoPorHora = {};
//     (data || []).forEach((d) => {
//       let dateStr = d.id || d.data || d.date;
//       if (!dateStr) return;
//       let [dia, hora] = dateStr.split(/[ T]/);
//       if (!hora) return;
//       hora = hora.slice(0, 2);
//       const chave = `${dia} ${hora}`;
//       const ws = Number(d.ws100);
//       const wd = Number(d.wdir100);
//       if (!isNaN(ws) && !isNaN(wd)) {
//         if (!agrupadoPorHora[chave]) agrupadoPorHora[chave] = { velocidades: [], direcoes: [] };
//         agrupadoPorHora[chave].velocidades.push(ws);
//         agrupadoPorHora[chave].direcoes.push(wd);
//       }
//     });

//     // 2. Calcular médias por hora
//     const medias = Object.keys(agrupadoPorHora).map((chave) => {
//       const { velocidades, direcoes } = agrupadoPorHora[chave];
//       const mediaVel = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
//       const { direcao } = mediaDirecao(direcoes, velocidades);
//       return {
//         ws: mediaVel,
//         wd: direcao
//       };
//     });

//     // 3. Wind Rose: Agrupar médias por direção e faixa de velocidade
//     const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
//     const windSpeedRanges = [2, 4, 6, 8, 10, 12, 15]; // Intervalos de velocidade do vento (m/s)

//     // Inicializar a frequência para cada direção e intervalo de velocidade
//     const frequencyData = directions.reduce((acc, direction) => {
//       acc[direction] = Array(windSpeedRanges.length).fill(0);
//       return acc;
//     }, {});

//     // Processar as médias horárias
//     medias.forEach((row) => {
//       const direction = row.wd;
//       const speed = row.ws;

//       // Validar os dados
//       if (isNaN(direction) || isNaN(speed)) return;

//       // Determinar a direção
//       let directionKey = null;
//       if ((direction >= 337.5 && direction <= 360) || (direction >= 0 && direction < 22.5)) directionKey = "N";
//       else if (direction >= 22.5 && direction < 67.5) directionKey = "NE";
//       else if (direction >= 67.5 && direction < 112.5) directionKey = "E";
//       else if (direction >= 112.5 && direction < 157.5) directionKey = "SE";
//       else if (direction >= 157.5 && direction < 202.5) directionKey = "S";
//       else if (direction >= 202.5 && direction < 247.5) directionKey = "SW";
//       else if (direction >= 247.5 && direction < 292.5) directionKey = "W";
//       else if (direction >= 292.5 && direction < 337.5) directionKey = "NW";

//       // Determinar o intervalo de velocidade
//       let speedRangeIndex = -1;
//       for (let i = 0; i < windSpeedRanges.length - 1; i++) {
//         if (speed >= windSpeedRanges[i] && speed < windSpeedRanges[i + 1]) {
//           speedRangeIndex = i;
//           break;
//         }
//       }
//       if (speed >= windSpeedRanges[windSpeedRanges.length - 1]) {
//         speedRangeIndex = windSpeedRanges.length - 1;
//       }

//       // Incrementar a frequência
//       if (directionKey && speedRangeIndex !== -1) {
//         frequencyData[directionKey][speedRangeIndex]++;
//       }
//     });

//     // Calcular porcentagens
//     const formattedData = directions.map((direction) => {
//       const total = frequencyData[direction].reduce((sum, value) => sum + value, 0);
//       return frequencyData[direction].map((value) => (total > 0 ? ((value / total) * 100).toFixed(2) : 0));
//     });

//     setChartData(formattedData);
//   }, [data]);

//   const options = {
//     chart: {
//       polar: true,
//       type: "column",
//     },
//     title: {
//       text: "Rosa dos Ventos",
//     },
//     pane: {
//       size: "85%",
//     },
//     xAxis: {
//       categories: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
//       tickmarkPlacement: "on",
//       lineWidth: 0,
//     },
//     yAxis: {
//       min: 0,
//       title: {
//         text: "Frequência ",
//       },
//       labels: {
//         format: "{value}",
//         visible: false,
//       },
//       reversedStacks: false,
//     },
//     tooltip: {
//       shared: true,
//       valueSuffix: "",
//     },
//     plotOptions: {
//       series: {
//         stacking: "normal",
//         shadow: false,
//         groupPadding: 0,
//         pointPlacement: "on",
//       },
//     },
//     colors: [
//       "#CAF0F8", // 2-4 
//       "#90E0EF", // 4-6 
//       "#84CAE4", // 6-8 
//       "#0096C7", // 8-10 
//       "#023E8A", // 10-12 
//       "#03045E", // <12 
//     ],
//     series: [
//       {
//         name: "2-4 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[0])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: "4-6 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[1])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: "6-8 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[2])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: "8-10 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[3])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: "10-12 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[4])) : [],
//         pointPlacement: "on",
//       },
//       {
//         name: ">12 m/s",
//         data: chartData.length ? chartData.map((item) => parseFloat(item[5])) : [],
//         pointPlacement: "on",
//       },
//     ],
//   };

//   return (
//     <div>
//       <HighchartsReact highcharts={Highcharts} options={options} />
//     </div>
//   );
// };

// export default WindRose;

import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more";

// Aplicar o módulo Highcharts-more
if (typeof HighchartsMore === "function") {
  HighchartsMore(Highcharts);
}

// Função para calcular média vetorial da direção
function mediaDirecao(direcoes, velocidades) {
  let sumX = 0, sumY = 0;
  for (let i = 0; i < direcoes.length; i++) {
    // Conversão para radianos
    const rad = (direcoes[i] * Math.PI) / 180;
    sumX += velocidades[i] * Math.cos(rad);
    sumY += velocidades[i] * Math.sin(rad);
  }
  const mediaRad = Math.atan2(sumY, sumX);
  let mediaGraus = (mediaRad * 180) / Math.PI;
  if (mediaGraus < 0) mediaGraus += 360;
  return { direcao: mediaGraus, rad: mediaRad };
}

const WindRoseChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setChartData([]);
      return;
    }

    // 1. Agrupar por hora (igual ao StickPlot)
    const agrupadoPorHora = {};
    (data || []).forEach((d) => {
      let dateStr = d.id || d.data || d.date;
      if (!dateStr) return;
      let [dia, hora] = dateStr.split(/[ T]/);
      if (!hora) return;
      hora = hora.slice(0, 2);
      const chave = `${dia} ${hora}`;
      const ws = Number(d.ws100);
      const wd = Number(d.wdir100);
      if (!isNaN(ws) && !isNaN(wd)) {
        if (!agrupadoPorHora[chave]) agrupadoPorHora[chave] = { velocidades: [], direcoes: [] };
        agrupadoPorHora[chave].velocidades.push(ws);
        agrupadoPorHora[chave].direcoes.push(wd);
      }
    });

    // 2. Calcular médias por hora (com conversão para radianos)
    const medias = Object.keys(agrupadoPorHora).map((chave) => {
      const { velocidades, direcoes } = agrupadoPorHora[chave];
      const mediaVel = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
      const { direcao, rad } = mediaDirecao(direcoes, velocidades);
      return {
        ws: mediaVel,
        wd: direcao, // graus
        wd_rad: rad // radianos
      };
    });

    // 3. Wind Rose: Agrupar médias por direção e faixa de velocidade
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const windSpeedRanges = [2, 4, 6, 8, 10, 12, 15]; // Intervalos de velocidade do vento (m/s)

    // Inicializar a frequência para cada direção e intervalo de velocidade
    const frequencyData = directions.reduce((acc, direction) => {
      acc[direction] = Array(windSpeedRanges.length).fill(0);
      return acc;
    }, {});

    // Processar as médias horárias
    medias.forEach((row) => {
      const direction = row.wd; // graus
      const speed = row.ws;

      // Validar os dados
      if (isNaN(direction) || isNaN(speed)) return;

      // Determinar a direção
      let directionKey = null;
      if ((direction >= 337.5 && direction <= 360) || (direction >= 0 && direction < 22.5)) directionKey = "N";
      else if (direction >= 22.5 && direction < 67.5) directionKey = "NE";
      else if (direction >= 67.5 && direction < 112.5) directionKey = "E";
      else if (direction >= 112.5 && direction < 157.5) directionKey = "SE";
      else if (direction >= 157.5 && direction < 202.5) directionKey = "S";
      else if (direction >= 202.5 && direction < 247.5) directionKey = "SW";
      else if (direction >= 247.5 && direction < 292.5) directionKey = "W";
      else if (direction >= 292.5 && direction < 337.5) directionKey = "NW";

      // Determinar o intervalo de velocidade
      let speedRangeIndex = -1;
      for (let i = 0; i < windSpeedRanges.length - 1; i++) {
        if (speed >= windSpeedRanges[i] && speed < windSpeedRanges[i + 1]) {
          speedRangeIndex = i;
          break;
        }
      }
      if (speed >= windSpeedRanges[windSpeedRanges.length - 1]) {
        speedRangeIndex = windSpeedRanges.length - 1;
      }

      // Incrementar a frequência
      if (directionKey && speedRangeIndex !== -1) {
        frequencyData[directionKey][speedRangeIndex]++;
      }
    });

    // Calcular porcentagens
    const formattedData = directions.map((direction) => {
      const total = frequencyData[direction].reduce((sum, value) => sum + value, 0);
      return frequencyData[direction].map((value) => (total > 0 ? ((value / total) * 100).toFixed(2) : 0));
    });

    setChartData(formattedData);
  }, [data]);

  const options = {
    chart: {
      polar: true,
      type: "column",
    },
    title: {
      text: "Rosa dos Ventos",
    },
    pane: {
      size: "85%",
    },
    xAxis: {
      categories: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"],
      tickmarkPlacement: "on",
      lineWidth: 0,
    },
    yAxis: {
      min: 0,
      title: {
        text: "Frequência (%)",
      },
      labels: {
        format: "{value}%",
      },
      reversedStacks: false,
    },
    tooltip: {
      shared: true,
      valueSuffix: "%",
    },
    plotOptions: {
      series: {
        stacking: "normal",
        shadow: false,
        groupPadding: 0,
        pointPlacement: "on",
      },
    },
    colors: [
      "#CAF0F8", // 2-4 
      "#90E0EF", // 4-6 
      "#84CAE4", // 6-8 
      "#0096C7", // 8-10 
      "#023E8A", // 10-12 
      "#03045E", // <12 
    ],
    series: [
      {
        name: "2-4 m/s",
        data: chartData.length ? chartData.map((item) => parseFloat(item[0])) : [],
        pointPlacement: "on",
      },
      {
        name: "4-6 m/s",
        data: chartData.length ? chartData.map((item) => parseFloat(item[1])) : [],
        pointPlacement: "on",
      },
      {
        name: "6-8 m/s",
        data: chartData.length ? chartData.map((item) => parseFloat(item[2])) : [],
        pointPlacement: "on",
      },
      {
        name: "8-10 m/s",
        data: chartData.length ? chartData.map((item) => parseFloat(item[3])) : [],
        pointPlacement: "on",
      },
      {
        name: "10-12 m/s",
        data: chartData.length ? chartData.map((item) => parseFloat(item[4])) : [],
        pointPlacement: "on",
      },
      {
        name: ">12 m/s",
        data: chartData.length ? chartData.map((item) => parseFloat(item[5])) : [],
        pointPlacement: "on",
      },
    ],
  };

  return (
    <div>
      <HighchartsReact highcharts={Highcharts} options={options} />
    </div>
  );
};

export default WindRoseChart;