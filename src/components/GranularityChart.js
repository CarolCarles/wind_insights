import React, { useMemo, useState } from "react";
import Plot from "react-plotly.js";

// Ordem igual à da referência: N na base, NNO no topo
const DIRECTIONS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO",
];

const DAY_MS = 1000 * 60 * 60 * 24;

const GRANULARITY_OPTIONS = [
  { key: "hourly", label: "Horária" },
  { key: "daily", label: "Diária" },
  { key: "weekly", label: "Semanal" },
  { key: "monthly", label: "Mensal" },
  { key: "quarterly", label: "Trimestral" },
  { key: "yearly", label: "Anual" },
];

// Estimativa grosseira de "tamanho" de cada granularidade em ms, usada só
// para estimar quantos bins um dataset vai gerar (heurística, não precisa
// ser exata para meses/trimestres/anos)
const APPROX_MS = {
  hourly: 1000 * 60 * 60,
  daily: DAY_MS,
  weekly: DAY_MS * 7,
  monthly: DAY_MS * 30,
  quarterly: DAY_MS * 91,
  yearly: DAY_MS * 365,
};

const MAX_RECOMMENDED_BINS = 400; // acima disso avisamos o usuário

// Escolhe a granularidade padrão de acordo com o intervalo total dos dados
function pickDefaultGranularity(spanMs) {
  if (spanMs <= 3 * DAY_MS) return "hourly";
  if (spanMs <= 60 * DAY_MS) return "daily";
  if (spanMs <= 2 * 365 * DAY_MS) return "weekly";
  if (spanMs <= 10 * 365 * DAY_MS) return "monthly";
  if (spanMs <= 20 * 365 * DAY_MS) return "quarterly";
  return "yearly";
}

// Retorna a data de início do "bucket" ao qual um registro pertence
function bucketStart(date, granularity) {
  const y = date.getFullYear();
  const m = date.getMonth(); // 0-based
  const d = date.getDate();
  const h = date.getHours();

  switch (granularity) {
    case "hourly":
      return new Date(y, m, d, h);
    case "daily":
      return new Date(y, m, d);
    case "weekly": {
      // Semana começando na segunda-feira
      const day = date.getDay(); // 0 = domingo
      const diffToMonday = (day + 6) % 7;
      const monday = new Date(y, m, d - diffToMonday);
      return monday;
    }
    case "monthly":
      return new Date(y, m, 1);
    case "quarterly": {
      const q = Math.floor(m / 3) * 3;
      return new Date(y, q, 1);
    }
    case "yearly":
      return new Date(y, 0, 1);
    default:
      return new Date(y, m, 1);
  }
}

function dirIndexFromDegrees(deg) {
  const norm = ((deg % 360) + 360) % 360;
  return Math.round(norm / 22.5) % 16;
}

export default function GranularityChart({ data }) {
  const [granularity, setGranularity] = useState(null);
  const [userOverrode, setUserOverrode] = useState(false);

  // Intervalo total dos dados e granularidade sugerida pela heurística
  const { spanMs, suggested } = useMemo(() => {
    if (!data || data.length === 0) return { spanMs: 0, suggested: "monthly" };

    let min = Infinity;
    let max = -Infinity;
    data.forEach((row) => {
      const t = new Date(row.year, (row.month || 1) - 1, row.day || 1, row.hour || 0, row.minute || 0).getTime();
      if (t < min) min = t;
      if (t > max) max = t;
    });

    const span = max - min;
    return { spanMs: span, suggested: pickDefaultGranularity(span) };
  }, [data]);

  const activeGranularity = userOverrode && granularity ? granularity : suggested;

  // Estimativa de nº de bins para cada opção, pra sinalizar escolhas ruins no dropdown
  const binEstimates = useMemo(() => {
    const estimates = {};
    GRANULARITY_OPTIONS.forEach(({ key }) => {
      estimates[key] = spanMs > 0 ? Math.ceil(spanMs / APPROX_MS[key]) || 1 : 0;
    });
    return estimates;
  }, [spanMs]);

  // Agregação: para cada bucket temporal, conta ocorrências por direção e
  // converte em % de ocorrências dentro daquele bucket
  const { xValues, yValues, sizes, colors, maxPercent } = useMemo(() => {
    const empty = { xValues: [], yValues: [], sizes: [], colors: [], maxPercent: 0 };
    if (!data || data.length === 0) return empty;

    const buckets = new Map(); // key: timestamp do início do bucket -> { total, dirCounts[16] }

    data.forEach((row) => {
      if (row.wdir100 === undefined || row.wdir100 === null || isNaN(row.wdir100)) return;

      const date = new Date(row.year, (row.month || 1) - 1, row.day || 1, row.hour || 0, row.minute || 0);
      const start = bucketStart(date, activeGranularity);
      const key = start.getTime();

      if (!buckets.has(key)) {
        buckets.set(key, { total: 0, dirCounts: new Array(16).fill(0), date: start });
      }
      const bucket = buckets.get(key);
      const idx = dirIndexFromDegrees(row.wdir100);
      bucket.dirCounts[idx] += 1;
      bucket.total += 1;
    });

    const xs = [];
    const ys = [];
    const sz = [];
    const cl = [];
    let maxPct = 0;

    Array.from(buckets.values())
      .sort((a, b) => a.date - b.date)
      .forEach((bucket) => {
        bucket.dirCounts.forEach((count, idx) => {
          if (count === 0) return;
          const pct = (count / bucket.total) * 100;
          if (pct > maxPct) maxPct = pct;
          xs.push(bucket.date);
          ys.push(DIRECTIONS[idx]);
          sz.push(pct);
          cl.push(pct);
        });
      });

    return { xValues: xs, yValues: ys, sizes: sz, colors: cl, maxPercent: maxPct };
  }, [data, activeGranularity]);

  const estimatedBinsForActive = binEstimates[activeGranularity] || 0;
  const showWarning = estimatedBinsForActive > MAX_RECOMMENDED_BINS;

  const TITLE = "Distribuição de Direção do Vento ao Longo do Tempo";

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 style={{ textAlign: "center" }}>{TITLE}</h2>

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label style={{ color: "#1a237e", fontWeight: 600, fontSize: 14 }}>
            Granularidade:
          </label>
          <select
            value={activeGranularity}
            onChange={(e) => {
              setGranularity(e.target.value);
              setUserOverrode(true);
            }}
            style={{
              background: "#f7faff",
              border: "1.5px solid #b3c8f9",
              borderRadius: 10,
              boxShadow: "0 2px 12px #e3e9f7",
              padding: "6px 10px",
              fontSize: 14,
              color: "#1a237e",
              cursor: "pointer",
            }}
          >
            {GRANULARITY_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
                {opt.key === suggested ? " (sugerido)" : ""}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            background: "#f7faff",
            border: "1px solid #b3c8f9",
            borderRadius: 8,
            padding: "10px 16px",
            color: "#0742e6",
            fontSize: 15,
            marginLeft: "auto",
            textAlign: "right",
            width: "fit-content",
          }}
        >
          <b>Dica:</b> Passe o mouse sobre os pontos para ver os valores.<br />
          Selecione uma área do gráfico para dar zoom, ou use o range slider abaixo.<br />
          Dê dois cliques na tela para voltar à visualização completa.
          {showWarning && (
            <>
              <br />
              <b>Atenção:</b> essa granularidade gera cerca de {estimatedBinsForActive} pontos
              no eixo do tempo para o período selecionado — o gráfico pode ficar poluído.
            </>
          )}
        </div>
      </div>

      <Plot
        data={[
          {
            type: "scatter",
            mode: "markers",
            x: xValues,
            y: yValues,
            marker: {
              size: sizes,
              sizemode: "area",
              sizeref: (2 * Math.max(maxPercent, 1)) / (34 * 34),
              sizemin: 2,
              color: colors,
              colorscale: [
                [0, "blue"],
                [0.5, "purple"],
                [1, "red"],
              ],
              cmin: 0,
              cmax: Math.max(maxPercent, 1),
              colorbar: {
                title: { text: "% de ocorrências", side: "right" },
              },
              line: { width: 0 },
            },
            hovertemplate: "%{x|%d/%m/%Y}<br>Direção: %{y}<br>%{marker.color:.1f}% de ocorrências<extra></extra>",
          },
        ]}
        layout={{
          title: TITLE,
          autosize: true,
          height: 620,
          margin: { l: 60, r: 30, t: 50, b: 60 },
          xaxis: {
            type: "date",
            rangeslider: { visible: true },
          },
          yaxis: {
            title: { text: "Direção" },
            type: "category",
            categoryorder: "array",
            categoryarray: DIRECTIONS,
          },
          plot_bgcolor: "#fff",
          paper_bgcolor: "#fff",
        }}
        config={{ responsive: true, displaylogo: false }}
        style={{ width: "100%" }}
        useResizeHandler
      />
    </div>
  );
}