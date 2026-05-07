import { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "../Styles/dfa.css";

const REGIMES = [
  { max: 0.30, label: "Antipersistente", color: "#E24B4A", description: "Série com forte reversão à média. Flutuações tendem a se corrigir rapidamente." },
  { max: 0.45, label: "Lev. antipersistente", color: "#EF9F27", description: "Leve tendência de reversão à média. Pequenas oscilações se autocorrigem." },
  { max: 0.55, label: "Ruído branco", color: "#888780", description: "Série sem memória temporal. Cada valor é independente do anterior." },
  { max: 0.75, label: "Persistente", color: "#1D9E75", description: "Série com memória de longo prazo. Tendências passadas influenciam valores futuros." },
  { max: 0.90, label: "Fortemente persistente", color: "#185FA5", description: "Alta persistência temporal. Padrões de longo prazo são bem definidos." },
  { max: 1.10, label: "Ruído rosa (1/f)", color: "#7F77DD", description: "Estrutura escalar típica de sistemas turbulentos e atmosféricos." },
  { max: 1.50, label: "Não estacionário", color: "#D85A30", description: "Série com tendência ou variância crescente. Pode indicar não estacionariedade." },
  { max: 99, label: "Passeio Browniano", color: "#D4537E", description: "Comportamento de passeio aleatório. Série fortemente não estacionária." },
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
      chart: { type: "scatter", backgroundColor: "#fff", height: 400, width: null },
      title: { text: "DFA 1D" },
      xAxis: { title: { text: "ln(n)" }, gridLineWidth: 1 },
      yAxis: { title: { text: "ln(F(n))" }, gridLineWidth: 1 },
      tooltip: {
        formatter: function () {
          return `<b>ln(n):</b> ${this.x.toFixed(3)}<br/><b>ln(F):</b> ${this.y.toFixed(3)}`;
        },
      },

      plotOptions: {
        scatter: { marker: { radius: 4 } },
        line: { marker: { enabled: false } },
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
      {result ? (
        <>
          <div className="dfa-wrapper">
            {/* Cards Laterais */}
            <div className="dfa-cards">
              <div className="dfa-card">
                <div className="dfa-card-label">Expoente α (Hurst)</div>
                <div className="dfa-card-value">{result.alpha.toFixed(3)}</div>
              </div>

              <div className="dfa-card">
                <div className="dfa-card-label">Regressão (R²)</div>
                <div className="dfa-card-value">{result.r2.toFixed(3)}</div>
              </div>

              <div className="dfa-card">
                <div className="dfa-card-label">Nº de Registros</div>
                <div className="dfa-card-value">{totalRegistros || "—"}</div>
              </div>

              <div className="dfa-card">
                <div className="dfa-card-label">Pontos no DFA</div>
                <div className="dfa-card-value">{result.ln_n.length}</div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="dfa-chart">
              <HighchartsReact highcharts={Highcharts} options={options} />
            </div>
          </div>

          <div className="dfa-info">
            {/* Card Inferior */}
            <div className="dfa-info-header">
              <strong>Velocidade</strong> — Regime detectado:{" "}
              <span
                className="dfa-regime-badge"
                style={{
                  background: regime.color + "22",
                  color: regime.color,
                  border: `1px solid ${regime.color}`,
                }}
              >
                {regime.label}
              </span>
            </div>
            <div className="dfa-info-description">{regime.description}</div>
            <div>
              <strong>Guia:</strong>{" "}
              α &lt; 0.5 → reversão à média &nbsp;|&nbsp;
              α ≈ 0.5 → ruído branco &nbsp;|&nbsp;
              0.5 &lt; α &lt; 1 → persistente &nbsp;|&nbsp;
              α ≈ 1 → ruído rosa &nbsp;|&nbsp;
              α &gt; 1 → série não estacionária
            </div>
          </div>
        </>
      ) : (
        <div className="dfa-empty">
          {!data ? "Nenhum CSV carregado." : "Dados insuficientes para DFA."}
        </div>
      )}
    </div>
  );
}