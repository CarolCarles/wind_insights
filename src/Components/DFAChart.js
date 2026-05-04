import React, { useState, useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Helpers
function linFit(x, y) {
  const n = x.length;
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (let i = 0; i < n; i++) {
    sx += x[i]; sy += y[i]; sxy += x[i] * y[i]; sxx += x[i] * x[i];
  }
  const denom = n * sxx - sx * sx;
  if (Math.abs(denom) < 1e-12) return { slope: 0, intercept: 0, r2: 0 };
  const slope = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const yMean = sy / n;
  let ssTot = 0, ssRes = 0;
  for (let i = 0; i < n; i++) {
    ssTot += (y[i] - yMean) ** 2;
    ssRes += (y[i] - (slope * x[i] + intercept)) ** 2;
  }
  const r2 = ssTot < 1e-12 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

function polyFit2(x, y) {
  const n = x.length;
  let s0 = n, s1 = 0, s2 = 0, s3 = 0, s4 = 0, t0 = 0, t1 = 0, t2 = 0;
  for (let i = 0; i < n; i++) {
    const xi = x[i], yi = y[i];
    s1 += xi; s2 += xi * xi; s3 += xi ** 3; s4 += xi ** 4;
    t0 += yi; t1 += xi * yi; t2 += xi * xi * yi;
  }
  const A = [[s0, s1, s2], [s1, s2, s3], [s2, s3, s4]];
  const B = [t0, t1, t2];
  for (let col = 0; col < 3; col++) {
    let maxR = col;
    for (let r = col + 1; r < 3; r++) {
      if (Math.abs(A[r][col]) > Math.abs(A[maxR][col])) maxR = r;
    }
    [A[col], A[maxR]] = [A[maxR], A[col]];
    [B[col], B[maxR]] = [B[maxR], B[col]];
    for (let r = col + 1; r < 3; r++) {
      const f = A[r][col] / A[col][col];
      for (let c = col; c < 3; c++) A[r][c] -= f * A[col][c];
      B[r] -= f * B[col];
    }
  }
  const coeffs = [0, 0, 0];
  for (let r = 2; r >= 0; r--) {
    coeffs[r] = B[r];
    for (let c = r + 1; c < 3; c++) coeffs[r] -= A[r][c] * coeffs[c];
    coeffs[r] /= A[r][r];
  }
  return coeffs;
}

function detrendSegment(segment, order) {
  const n = segment.length;
  const xi = Array.from({ length: n }, (_, k) => k);
  if (order === 1) {
    const { slope, intercept } = linFit(xi, segment);
    return segment.map((v, k) => v - (slope * k + intercept));
  }
  const [a, b, c] = polyFit2(xi, segment);
  return segment.map((v, k) => v - (a + b * k + c * k * k));
}

// DFA 1D principal
function dfa1d(signal, nScales = 20, order = 1) {
  const N = signal.length;
  const sMin = Math.max(order + 2, 10);
  const sMax = Math.floor(N / 4);
  if (sMax < sMin || N < 50) return null;

  const mean = signal.reduce((a, b) => a + b, 0) / N;
  const profile = new Float64Array(N);
  let cum = 0;
  for (let i = 0; i < N; i++) { cum += signal[i] - mean; profile[i] = cum; }

  const logMin = Math.log10(sMin), logMax = Math.log10(sMax);
  const scalesSet = new Set();
  for (let i = 0; i < nScales; i++) {
    const s = Math.round(Math.pow(10, logMin + (logMax - logMin) * i / (nScales - 1)));
    if (s >= sMin && s <= sMax) scalesSet.add(s);
  }
  const scales = [...scalesSet].sort((a, b) => a - b);
  if (scales.length < 4) return null;

  const fluct = scales.map(s => {
    const nSeg = Math.floor(N / s);
    if (nSeg < 2) return null;
    let sumSq = 0;
    for (let seg = 0; seg < nSeg; seg++) {
      const block = Array.from(profile.subarray(seg * s, (seg + 1) * s));
      const res = detrendSegment(block, order);
      sumSq += res.reduce((a, v) => a + v * v, 0) / s;
    }
    return Math.sqrt(sumSq / nSeg);
  });

  const valid = scales
    .map((s, i) => (fluct[i] != null && fluct[i] > 0 ? { s, f: fluct[i] } : null))
    .filter(Boolean);
  if (valid.length < 4) return null;

  const logS = valid.map(d => Math.log10(d.s));
  const logF = valid.map(d => Math.log10(d.f));
  const fit = linFit(logS, logF);

  const sLine = [valid[0].s, valid[valid.length - 1].s];
  const fLine = sLine.map(s => Math.pow(10, fit.intercept + fit.slope * Math.log10(s)));

  return {
    scales: valid.map(d => d.s),
    fluct: valid.map(d => d.f),
    alpha: fit.slope,
    r2: fit.r2,
    sLine,
    fLine,
    N,
  };
}

// Tabela (α)
const REGIMES = [
  { max: 0.30, label: "Antipersistente",        color: "#E24B4A", desc: "Série revertente à média com alta frequência. Alternância rápida." },
  { max: 0.45, label: "Lev. antipersistente",   color: "#EF9F27", desc: "Tendência fraca de reversão. Próxima de ruído branco." },
  { max: 0.55, label: "Ruído branco (α ≈ 0.5)", color: "#888780", desc: "Série sem memória de longo alcance. Valores praticamente independentes." },
  { max: 0.75, label: "Persistente",            color: "#1D9E75", desc: "Memória de longo alcance: tendências se mantêm por mais tempo." },
  { max: 0.90, label: "Fortemente persistente", color: "#185FA5", desc: "Alta memória. Padrões de velocidade se propagam no tempo." },
  { max: 1.10, label: "Ruído rosa (1/f)",        color: "#7F77DD", desc: "Estrutura escalar típica de sistemas turbulentos e atmosféricos." },
  { max: 1.50, label: "Não estacionário",        color: "#D85A30", desc: "Série possivelmente não estacionária ou com tendência determinística." },
  { max: 99,   label: "Passeio Browniano",       color: "#D4537E", desc: "Série integrada. Diferenciação pode ser necessária para análise." },
];

function getRegime(alpha) {
  return REGIMES.find(r => alpha < r.max) || REGIMES[REGIMES.length - 1];
}

export default function DFAChart({ data }) {
  const [sigType, setSigType]     = useState("ws");
  const [nScales, setNScales]     = useState(20);
  const [polyOrder, setPolyOrder] = useState(1);

  // Extrai sinal conforme tipo escolhido
  const signal = useMemo(() => {
    if (!data || data.length === 0) return [];
    if (sigType === "ws") {
      return data.map(d => parseFloat(d.ws100)).filter(v => isFinite(v));
    }
    return data.map(d => {
      const ws = parseFloat(d.ws100);
      const wd = parseFloat(d.wdir100);
      if (!isFinite(ws) || !isFinite(wd)) return NaN;
      const rad = wd * Math.PI / 180;
      return sigType === "u" ? ws * Math.cos(rad) : ws * Math.sin(rad);
    }).filter(v => isFinite(v));
  }, [data, sigType]);

  // Executa DFA
  const result = useMemo(() => dfa1d(signal, nScales, polyOrder), [signal, nScales, polyOrder]);

  // Monta options do Highcharts
  const options = useMemo(() => {
    if (!result) return null;

    return {
      chart: {
        type: "scatter",
        backgroundColor: "#fff",
        width: null,
        height: 400,
        reflow: true,
      },
      title: {
        text: "DFA 1D — Flutuação vs Escala",
      },
      xAxis: {
        type: "logarithmic",
        title: { text: "Escala s (pontos)" },
        gridLineWidth: 1,
        gridLineColor: "lightgray",
      },
      yAxis: {
        type: "logarithmic",
        title: { text: "F(s) — flutuação RMS" },
        gridLineColor: "lightgray",
      },
      tooltip: {
        formatter: function () {
          if (this.series.name === "F(s)") {
            return `<b>s:</b> ${this.x.toFixed(0)}<br/><b>F(s):</b> ${this.y.toFixed(4)}`;
          }
          return `<b>Regressão</b><br/>α = ${result.alpha.toFixed(3)}`;
        },
      },
      plotOptions: {
        scatter: {
          marker: { radius: 4, symbol: "circle" },
        },
        line: {
          marker: { enabled: false },
          enableMouseTracking: false,
        },
      },
      series: [
        {
          name: "F(s)",
          type: "scatter",
          data: result.scales.map((s, i) => [s, result.fluct[i]]),
          color: "#185FA5",
        },
        {
          name: `Regressão (α = ${result.alpha.toFixed(3)})`,
          type: "line",
          data: result.sLine.map((s, i) => [s, result.fLine[i]]),
          color: "#E24B4A",
          dashStyle: "Dash",
          lineWidth: 2,
        },
      ],
      legend: {
        enabled: true,
      },
    };
  }, [result]);

  const regime = result ? getRegime(result.alpha) : null;
  const SIG_LABELS = { ws: "Velocidade (ws100)", u: "Componente U (zonal)", v: "Componente V (meridional)" };

  return (
    <div>
      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#0742e6" }}>Análise DFA 1D</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Detrended Fluctuation Analysis — memória de longo alcance</div>
        </div>

        {/* Controles */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center", fontSize: 13 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#1a237e", fontWeight: 600 }}>
            Sinal:
            <select value={sigType} onChange={e => setSigType(e.target.value)}
              style={{ border: "1.5px solid #b3c8f9", borderRadius: 7, padding: "4px 8px", fontSize: 13, color: "#0742e6" }}>
              <option value="ws">Velocidade (ws100)</option>
              <option value="u">Componente U (zonal)</option>
              <option value="v">Componente V (meridional)</option>
            </select>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#1a237e", fontWeight: 600 }}>
            Escalas:
            <input type="range" min={10} max={40} step={1} value={nScales}
              onChange={e => setNScales(Number(e.target.value))}
              style={{ width: 80 }} />
            <span style={{ minWidth: 22 }}>{nScales}</span>
          </label>

          <label style={{ display: "flex", alignItems: "center", gap: 6, color: "#1a237e", fontWeight: 600 }}>
            Polinômio:
            <select value={polyOrder} onChange={e => setPolyOrder(Number(e.target.value))}
              style={{ border: "1.5px solid #b3c8f9", borderRadius: 7, padding: "4px 8px", fontSize: 13, color: "#0742e6" }}>
              <option value={1}>Ordem 1 (linear)</option>
              <option value={2}>Ordem 2 (quadrático)</option>
            </select>
          </label>
        </div>
      </div>

      {result ? (
        <>
          {/* Cards de métricas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 10, marginBottom: 20 }}>
            {[
              {
                label: "Expoente α (Hurst)", value: result.alpha.toFixed(3),
                sub: <span style={{ background: regime.color + "22", color: regime.color, border: `0.5px solid ${regime.color}66`, borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>{regime.label}</span>
              },
              {
                label: "R² do ajuste log-log", value: result.r2.toFixed(3),
                sub: result.r2 >= 0.98 ? "excelente" : result.r2 >= 0.92 ? "bom" : "verificar ajuste"
              },
              {
                label: "Pontos no sinal", value: signal.length.toLocaleString("pt-BR"),
                sub: `de ${(data || []).length.toLocaleString("pt-BR")} registros`
              },
              {
                label: "Escalas usadas", value: result.scales.length,
                sub: `${result.scales[0]} → ${result.scales[result.scales.length - 1]}`
              },
            ].map(({ label, value, sub }) => (
              <div key={label} style={{ background: "#f7faff", borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#0742e6" }}>{value}</div>
                <div style={{ fontSize: 12, marginTop: 3, color: "#555" }}>{sub}</div>
              </div>
            ))}
          </div>

          {/* Gráfico Highcharts */}
          <div style={{ width: "100%" }}>
            <HighchartsReact
              highcharts={Highcharts}
              options={options}
              containerProps={{ style: { width: "100%" } }}
            />
          </div>

          {/* Interpretação */}
          <div style={{ marginTop: 16, padding: "12px 0", fontSize: 13, color: "#444", lineHeight: 1.7 }}>
            <strong>{SIG_LABELS[sigType]}</strong> &mdash; Regime detectado:{" "}
            <span style={{ background: regime.color + "22", color: regime.color, border: `0.5px solid ${regime.color}66`, borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
              {regime.label}
            </span>
            <br /><br />
            {regime.desc}
            <br /><br />
            <span style={{ color: "#888" }}>
              <strong>Guia:</strong> α &lt; 0.5 → reversão à média &nbsp;|&nbsp;
              α ≈ 0.5 → ruído branco &nbsp;|&nbsp;
              0.5 &lt; α &lt; 1 → persistente &nbsp;|&nbsp;
              α ≈ 1 → ruído rosa &nbsp;|&nbsp;
              α &gt; 1 → série não estacionária
            </span>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", color: "#888", padding: "40px 0", fontSize: 14 }}>
          {!data || data.length === 0
            ? "Carregue um arquivo CSV para visualizar a análise DFA."
            : "Série muito curta para os parâmetros atuais. Amplie o filtro de datas ou reduza o número de escalas."}
        </div>
      )}
    </div>
  );
}
