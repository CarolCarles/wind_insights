// import React, { useState } from "react";
// import Plot from "react-plotly.js";

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

// function StickPlot({ data }) {
//   const scale = 1;
//   const X_SPACING = 2;
//   const AGRUPAMENTO = 1; // Use 1 para cada hora, 3 para cada 3 horas, etc.

//   // Agrupa por dia e hora
//   const agrupadoPorHora = {};
//   (data || []).forEach((d) => {
//     let dateStr = d.id || d.data || d.date;
//     if (!dateStr) return;
//     let [dia, hora] = dateStr.split(/[ T]/);
//     if (!hora) return;
//     hora = hora.slice(0, 2);
//     const chave = `${dia} ${hora}`;
//     const ws = Number(d.ws100);
//     const wd = Number(d.wdir100);
//     if (!isNaN(ws) && !isNaN(wd)) {
//       if (!agrupadoPorHora[chave]) agrupadoPorHora[chave] = { velocidades: [], direcoes: [], dia, hora };
//       agrupadoPorHora[chave].velocidades.push(ws);
//       agrupadoPorHora[chave].direcoes.push(wd);
//     }
//   });

//   // Calcula médias por hora
//   const chaves = Object.keys(agrupadoPorHora);
//   const medias = chaves.map((chave, i) => {
//     const { velocidades, direcoes, dia, hora } = agrupadoPorHora[chave];
//     const mediaVel = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
//     const { direcao } = mediaDirecao(direcoes, velocidades);
//     return {
//       idx: (i + 1) * X_SPACING,
//       id: `${dia} ${hora}h`,
//       ws: mediaVel,
//       wd: direcao
//     };
//   });
//   // Amostragem/agrupamento extra se desejar
//   const mediasAgrupadas = medias.filter((_, i) => i % AGRUPAMENTO === 0);

//   // PAGINAÇÃO
//   const PAGE_SIZE = 100; // Quantos vetores por página
//   const [page, setPage] = useState(0);

//   const totalPages = Math.ceil(mediasAgrupadas.length / PAGE_SIZE);
//   const start = page * PAGE_SIZE;
//   const end = start + PAGE_SIZE;
//   const pageData = mediasAgrupadas.slice(start, end);

//   if (pageData.length === 0) {
//     return <div>Nenhum dado válido para exibir o StickPlot.</div>;
//   }

//   // Cálculo dos vetores para a página atual
//   const x0 = pageData.map(d => d.idx);
//   const y0 = Array(pageData.length).fill(0);
//   const velocidades = pageData.map(d => d.ws);
//   const direcoes_graus = pageData.map(d => d.wd);
//   // const direcoes_rad = direcoes_graus.map(d => (d * Math.PI) / 180);
//   const direcoes_rad = direcoes_graus.map(d => ((d + 180) % 360) * Math.PI / 180);

//   const x1 = x0.map((x, i) => x + velocidades[i] * Math.cos(direcoes_rad[i]) * scale);
//   const y1 = y0.map((y, i) => y + velocidades[i] * Math.sin(direcoes_rad[i]) * scale);
//   const maxLen = Math.max(...velocidades) * scale + 1;

//   const lines = pageData.map((d, i) => ({
//     type: 'scatter',
//     mode: 'lines',
//     x: [x0[i], x1[i]],
//     y: [y0[i], y1[i]],
//     line: { color: '#000', width: 2 },
//     showlegend: false,
//     hoverinfo: 'text',
//     text: [`Data: ${d.id}<br>Vel média: ${velocidades[i].toFixed(2)}<br>Dir média: ${direcoes_graus[i].toFixed(1)}`]
//   }));

// const layout = {
//   title: "Stick Plot - Média por Hora",
//   xaxis: {
//     title: 'Hora',
//     // tickvals: x0,
//     // ticktext: pageData.map(d => d.id),
//     showgrid: false,
//     tickfont: { size: 8 },
//     showticklabels: false,
//   },
//   yaxis: {
//     title: {
//       text: 'Velocidade (m/s)',
//       font: { size: 12, color: '#222' }
//     },
//     range: [-maxLen, maxLen],
//     showgrid: false
//   },
//   showlegend: false,
//   height: 450,
//   width: 900, // ou "100%"
//   margin: { l: 90, r: 30, t: 50, b: 120 }
// };

//   return (
//     <div>
//       <h2 style={{ textAlign: "center" }}>Stick Plot - Média por Hora</h2>
//       <div
//         style={{
//           background: "#f7faff",
//           border: "1px solid #b3c8f9",
//           borderRadius: 8,
//           padding: "10px 16px",
//           marginBottom: 12,
//           color: "#0742e6",
//           fontSize: 15,
//           marginLeft: "auto",
//           textAlign: "right",
//           width: "fit-content"
//         }}
//       >
//         <b>Dica:</b> Passe o mouse sobre os vetores para ver os valores de cada ponto.<br />
//         Selecione uma área do gráfico para dar zoom.<br />
//         Dê dois cliques na tela para voltar à visualização completa.
//       </div>
//       <Plot
//         data={lines}
//         layout={layout}
//         style={{ width: "100%", height: "100%" }}
//         config={{ responsive: true, displayModeBar: true, showTips: false }}
//       />
//       <div style={{ marginTop: 18, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
//         <button
//           onClick={() => setPage(p => Math.max(p - 1, 0))}
//           disabled={page === 0}
//           style={{
//             background: "#061642",
//             color: "#fff",
//             border: "none",
//             borderRadius: "50%",
//             width: 36,
//             height: 36,
//             fontSize: 22,
//             cursor: page === 0 ? "not-allowed" : "pointer",
//             opacity: page === 0 ? 0.5 : 1,
//             transition: "background 0.2s"
//           }}
//           title="Página anterior"
//         >
//           &#8592;
//         </button>
//         <input
//           type="range"
//           min={0}
//           max={totalPages - 1}
//           value={page}
//           onChange={e => setPage(Number(e.target.value))}
//           style={{ width: 200 }}
//         />
//         <button
//           onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
//           disabled={page === totalPages - 1}
//           style={{
//             background: "#061642",
//             color: "#fff",
//             border: "none",
//             borderRadius: "50%",
//             width: 36,
//             height: 36,
//             fontSize: 22,
//             cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
//             opacity: page === totalPages - 1 ? 0.5 : 1,
//             transition: "background 0.2s"
//           }}
//           title="Próxima página"
//         >
//           &#8594;
//         </button>
//       </div>
//       <div style={{ marginTop: 2, textAlign: "center" }}>
//         <span style={{ minWidth: 90 }}>
//           Página <b>{page + 1}</b> de <b>{totalPages}</b>
//         </span>
//       </div>
//     </div>
//   );
// }

// export default StickPlot;

import React, { useState } from "react";
import Plot from "react-plotly.js";

// Função para calcular média vetorial da direção
function mediaDirecao(direcoes, velocidades) {
  let sumX = 0, sumY = 0;
  for (let i = 0; i < direcoes.length; i++) {
    const rad = (direcoes[i] * Math.PI) / 180;
    sumX += velocidades[i] * Math.cos(rad);
    sumY += velocidades[i] * Math.sin(rad);
  }
  const mediaRad = Math.atan2(sumY, sumX);
  let mediaGraus = (mediaRad * 180) / Math.PI;
  if (mediaGraus < 0) mediaGraus += 360;
  return { direcao: mediaGraus };
}

// Função utilitária para criar as setas
function arrowHead(x1, y1, angle, size = 0.3) {
  // angle em radianos, size em unidades do gráfico
  const angle1 = angle + Math.PI / 8; // 22.5 graus
  const angle2 = angle - Math.PI / 8;
  return [
    {
      type: 'scatter',
      mode: 'lines',
      x: [x1, x1 - size * Math.cos(angle1)],
      y: [y1, y1 - size * Math.sin(angle1)],
      line: { color: '#0742e6', width: 2 },
      showlegend: false,
      hoverinfo: 'skip'
    },
    {
      type: 'scatter',
      mode: 'lines',
      x: [x1, x1 - size * Math.cos(angle2)],
      y: [y1, y1 - size * Math.sin(angle2)],
      line: { color: '#0742e6', width: 2 },
      showlegend: false,
      hoverinfo: 'skip'
    }
  ];
}

function StickPlot({ data }) {
  const scale = 1;
  const X_SPACING = 2;
  const AGRUPAMENTO = 1; // Use 1 para cada hora, 3 para cada 3 horas, etc.

  // Agrupa por dia e hora
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
      if (!agrupadoPorHora[chave]) agrupadoPorHora[chave] = { velocidades: [], direcoes: [], dia, hora };
      agrupadoPorHora[chave].velocidades.push(ws);
      agrupadoPorHora[chave].direcoes.push(wd);
    }
  });

  // Calcula médias por hora
  const chaves = Object.keys(agrupadoPorHora);
  const medias = chaves.map((chave, i) => {
    const { velocidades, direcoes, dia, hora } = agrupadoPorHora[chave];
    const mediaVel = velocidades.reduce((a, b) => a + b, 0) / velocidades.length;
    const { direcao } = mediaDirecao(direcoes, velocidades);
    return {
      idx: (i + 1) * X_SPACING,
      id: `${dia} ${hora}h`,
      ws: mediaVel,
      wd: direcao
    };
  });
  // Amostragem/agrupamento extra se desejar
  const mediasAgrupadas = medias.filter((_, i) => i % AGRUPAMENTO === 0);

  // PAGINAÇÃO
  const PAGE_SIZE = 100; // Quantos vetores por página
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(mediasAgrupadas.length / PAGE_SIZE);
  const start = page * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pageData = mediasAgrupadas.slice(start, end);

  if (pageData.length === 0) {
    return <div>Nenhum dado válido para exibir o StickPlot.</div>;
  }

  // Cálculo dos vetores para a página atual
  const x0 = pageData.map(d => d.idx);
  const y0 = Array(pageData.length).fill(0);
  const velocidades = pageData.map(d => d.ws);
  const direcoes_graus = pageData.map(d => d.wd);
  // Corrigido: soma 180 graus para indicar para onde o vento vai
  const direcoes_rad = direcoes_graus.map(d => ((d + 180) % 360) * Math.PI / 180);

  const x1 = x0.map((x, i) => x + velocidades[i] * Math.cos(direcoes_rad[i]) * scale);
  const y1 = y0.map((y, i) => y + velocidades[i] * Math.sin(direcoes_rad[i]) * scale);
  const maxLen = Math.max(...velocidades) * scale + 1;

  // Linhas principais dos vetores
  const lines = pageData.map((d, i) => ({
    type: 'scatter',
    mode: 'lines',
    x: [x0[i], x1[i]],
    y: [y0[i], y1[i]],
    line: { color: '#000', width: 2 },
    showlegend: false,
    hoverinfo: 'text',
    text: [`Data: ${d.id}<br>Vel média: ${velocidades[i].toFixed(2)}<br>Dir média: ${direcoes_graus[i].toFixed(1)}`]
  }));

  // Setas nas pontas dos vetores
  const arrows = [];
  pageData.forEach((d, i) => {
    arrows.push(
      ...arrowHead(x1[i], y1[i], direcoes_rad[i], 0.5)
    );
  });

  // Junta linhas e setas
  const plotData = [...lines, ...arrows];

  const layout = {
    title: "Stick Plot - Média por Hora",
    xaxis: {
      title: 'Hora',
      showgrid: false,
      tickfont: { size: 8 },
      showticklabels: false,
    },
    yaxis: {
      title: {
        text: 'Velocidade (m/s)',
        font: { size: 12, color: '#222' }
      },
      range: [-maxLen, maxLen],
      showgrid: false
    },
    showlegend: false,
    height: 450,
    width: 900,
    margin: { l: 90, r: 30, t: 50, b: 120 }
  };

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>Stick Plot - Média por Hora</h2>
      <div
        style={{
          background: "#f7faff",
          border: "1px solid #b3c8f9",
          borderRadius: 8,
          padding: "10px 16px",
          marginBottom: 12,
          color: "#0742e6",
          fontSize: 15,
          marginLeft: "auto",
          textAlign: "right",
          width: "fit-content"
        }}
      >
        <b>Dica:</b> Passe o mouse sobre os vetores para ver os valores de cada ponto.<br />
        Selecione uma área do gráfico para dar zoom.<br />
        Dê dois cliques na tela para voltar à visualização completa.
      </div>
      <Plot
        data={plotData}
        layout={layout}
        style={{ width: "100%", height: "100%" }}
        config={{ responsive: true, displayModeBar: true, showTips: false }}
      />
      <div style={{ marginTop: 18, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <button
          onClick={() => setPage(p => Math.max(p - 1, 0))}
          disabled={page === 0}
          style={{
            background: "#061642",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            fontSize: 22,
            cursor: page === 0 ? "not-allowed" : "pointer",
            opacity: page === 0 ? 0.5 : 1,
            transition: "background 0.2s"
          }}
          title="Página anterior"
        >
          &#8592;
        </button>
        <input
          type="range"
          min={0}
          max={totalPages - 1}
          value={page}
          onChange={e => setPage(Number(e.target.value))}
          style={{ width: 200 }}
        />
        <button
          onClick={() => setPage(p => Math.min(p + 1, totalPages - 1))}
          disabled={page === totalPages - 1}
          style={{
            background: "#061642",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 36,
            height: 36,
            fontSize: 22,
            cursor: page === totalPages - 1 ? "not-allowed" : "pointer",
            opacity: page === totalPages - 1 ? 0.5 : 1,
            transition: "background 0.2s"
          }}
          title="Próxima página"
        >
          &#8594;
        </button>
      </div>
      <div style={{ marginTop: 2, textAlign: "center" }}>
        <span style={{ minWidth: 90 }}>
          Página <b>{page + 1}</b> de <b>{totalPages}</b>
        </span>
      </div>
    </div>
  );
}

export default StickPlot;