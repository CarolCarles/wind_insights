import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

const REGIMES = [
  { max: 0.30, label: "Antipersistente", color: "#E24B4A" },
  { max: 0.45, label: "Lev. antipersistente", color: "#EF9F27" },
  { max: 0.55, label: "Ruído branco", color: "#888780" },
  { max: 0.75, label: "Persistente", color: "#1D9E75" },
  { max: 0.90, label: "Fortemente persistente", color: "#185FA5" },
  { max: 1.10, label: "Ruído rosa (1/f)", color: "#7F77DD" },
  { max: 1.50, label: "Não estacionário", color: "#D85A30" },
  { max: 99, label: "Passeio Browniano", color: "#D4537E" },
];

function getRegime(alpha) {
  return REGIMES.find(r => alpha < r.max) || REGIMES[REGIMES.length - 1];
}

export default function DFAChart({ data, totalRegistros }) {

  const result = useMemo(() => {
    if (!data || !data.ln_n || data.ln_n.length < 4) return null;

    return {
      ln_n: data.ln_n,
      ln_F: data.ln_F,
      ln_F_fit: data.ln_F_fit,
      alpha: data.H,
      r2: data.r2
    };
  }, [data]);

  const options = useMemo(() => {
    if (!result) return null;

    return {
      chart: {
        type: "scatter",
        backgroundColor: "#fff",
        height: 400,
      },

      title: {
        text: "DFA 1D (fathon) — ln(F) vs ln(n)",
      },

      xAxis: {
        title: { text: "ln(n)" },
        gridLineWidth: 1,
      },

      yAxis: {
        title: { text: "ln(F(n))" },
        gridLineWidth: 1,
      },

      tooltip: {
        formatter: function () {
          return `<b>ln(n):</b> ${this.x.toFixed(3)}<br/>
                  <b>ln(F):</b> ${this.y.toFixed(3)}`;
        },
      },

      plotOptions: {
        scatter: {
          marker: { radius: 4 },
        },
        line: {
          marker: { enabled: false },
        },
      },

      series: [
        {
          name: "Dados (ln F)",
          type: "scatter",
          data: result.ln_n.map((x, i) => [x, result.ln_F[i]]),
          color: "#185FA5",
        },
        {
          name: `Ajuste linear (H = ${result.alpha.toFixed(3)})`,
          type: "line",
          data: result.ln_n.map((x, i) => [x, result.ln_F_fit[i]]),
          color: "#E24B4A",
          dashStyle: "Dash",
          lineWidth: 2,
        },
      ],
    };
  }, [result]);

  const regime = result ? getRegime(result.alpha) : null;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#0742e6" }}>
          DFA 1D — Implementação Fiel ao fathon
        </div>
        <div style={{ fontSize: 13, color: "#888" }}>
          ln(F(n)) vs ln(n)
        </div>
      </div>

      {result ? (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: 10, marginBottom: 20 }}>
            <div style={{ background: "#f7faff", padding: 12 }}>
              <div>α (H)</div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>{result.alpha.toFixed(3)}</div>
              <div style={{ color: regime.color }}>{regime.label}</div>
            </div>

            <div style={{ background: "#f7faff", padding: 12 }}>
              <div>R²</div>
              <div style={{ fontSize: 22 }}>{result.r2.toFixed(3)}</div>
            </div>

            <div style={{ background: "#f7faff", padding: 12 }}>
              <div>Registros</div>
              <div style={{ fontSize: 22 }}>{totalRegistros || "—"}</div>
            </div>

            <div style={{ background: "#f7faff", padding: 12 }}>
              <div>Pontos DFA</div>
              <div style={{ fontSize: 22 }}>{result.ln_n.length}</div>
            </div>
          </div>

          <HighchartsReact highcharts={Highcharts} options={options} />

          <div style={{ marginTop: 16 }}>
            <strong>Regime:</strong>{" "}
            <span style={{ color: regime.color }}>{regime.label}</span>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: 40, color: "#888" }}>
          {!data ? "Carregue dados." : "Dados insuficientes para DFA."}
        </div>
      )}
    </div>
  );
}