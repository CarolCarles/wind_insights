import React, { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

// Painéis da decomposição, na ordem em que aparecem (de cima para baixo)
const PAINEIS = [
  { chave: "observada", rotulo: "Observada", cor: "#000000" },
  { chave: "tendencia", rotulo: "Tendência", cor: "#0742e6" },
  { chave: "sazonal", rotulo: "Sazonalidade", cor: "#1D9E75" },
  { chave: "residuo", rotulo: "Ruído", cor: "#888780" },
];

const ALTURA_PAINEL = 22; // % da área de plotagem
const ESPACO_PAINEL = 3; // % entre painéis

const CONCLUSOES = {
  estacionaria: { rotulo: "Estacionária", cor: "#1D9E75" },
  nao_estacionaria: { rotulo: "Não estacionária", cor: "#E24B4A" },
  inconclusiva: { rotulo: "Inconclusiva", cor: "#EF9F27" },
};

function formatar(valor, casas = 2) {
  if (valor === null || valor === undefined) return "—";
  return valor.toLocaleString("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });
}

// O p-valor do KPSS é interpolado em uma tabela e fica limitado a [0,01; 0,10]
function formatarP(p, teste) {
  if (p === null || p === undefined) return "—";
  if (teste === "kpss") {
    if (p <= 0.01) return "≤ 0,01";
    if (p >= 0.1) return "≥ 0,10";
  }
  if (p < 0.0001) return "< 0,0001";
  return formatar(p, 4);
}

function Indicador({ rotulo, valor, dica }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-brand-border bg-brand-soft p-3 text-center">
      <div className="text-sm text-slate-600">{rotulo}</div>
      <div className="text-xl font-bold text-slate-800">{valor}</div>
      {dica && <div className="mt-0.5 text-xs text-slate-500">{dica}</div>}
    </div>
  );
}

function Selo({ conclusao }) {
  const info = CONCLUSOES[conclusao] || CONCLUSOES.inconclusiva;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
      style={{
        background: info.cor + "22",
        color: info.cor,
        border: `1px solid ${info.cor}`,
      }}
    >
      {info.rotulo}
    </span>
  );
}

function LinhaTeste({ rotulo, teste }) {
  return (
    <tr className="border-b border-line last:border-b-0">
      <td className="px-3 py-2 text-left font-medium text-slate-700">{rotulo}</td>
      <td className="px-3 py-2 text-center">{formatar(teste.adf_estatistica, 2)}</td>
      <td className="px-3 py-2 text-center">{formatarP(teste.adf_p, "adf")}</td>
      <td className="px-3 py-2 text-center">{formatar(teste.kpss_estatistica, 2)}</td>
      <td className="px-3 py-2 text-center">{formatarP(teste.kpss_p, "kpss")}</td>
      <td className="px-3 py-2 text-center">
        <Selo conclusao={teste.conclusao} />
      </td>
    </tr>
  );
}

export default function ARIMAChart({ data }) {
  const options = useMemo(() => {
    if (!data || data.erro || !data.t) return null;

    const pontos = {};
    PAINEIS.forEach((p) => {
      pontos[p.chave] = data.t.map((t, i) => [t, data[p.chave][i]]);
    });

    return {
      chart: { type: "line", height: 720, zoomType: "x", backgroundColor: "#fff" },
      title: { text: "Decomposição da Série (STL): Tendência, Sazonalidade e Ruído" },
      legend: { enabled: false },
      xAxis: { type: "datetime", crosshair: true, title: { text: "Data" } },
      yAxis: PAINEIS.map((p, i) => ({
        title: { text: p.rotulo },
        top: `${i * (ALTURA_PAINEL + ESPACO_PAINEL)}%`,
        height: `${ALTURA_PAINEL}%`,
        offset: 0,
        lineWidth: 1,
        // sazonalidade e ruído oscilam em torno de zero
        plotLines:
          p.chave === "sazonal" || p.chave === "residuo"
            ? [{ value: 0, width: 1, color: "#999999", zIndex: 3 }]
            : [],
      })),
      tooltip: { shared: true, split: true, valueDecimals: 2, valueSuffix: " m/s" },
      plotOptions: {
        series: { lineWidth: 1, marker: { enabled: false } },
      },
      series: PAINEIS.map((p, i) => ({
        name: p.rotulo,
        yAxis: i,
        data: pontos[p.chave],
        color: p.cor,
      })),
    };
  }, [data]);

  if (!data) {
    return (
      <div className="py-10 text-center text-slate-500">
        Calculando decomposição e testes de estacionariedade... A primeira requisição pode demorar
        alguns instantes (o servidor gratuito "dorme" quando fica sem uso).
      </div>
    );
  }

  if (data.erro) {
    return <div className="py-10 text-center text-red-600">{data.erro}</div>;
  }

  const { metricas, estacionariedade } = data;
  const dSugerido = estacionariedade.d_sugerido;

  return (
    <div className="flex flex-col gap-4">
      {/* Indicadores */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Indicador
          rotulo="Força da tendência"
          valor={formatar(metricas.forca_tendencia, 2)}
          dica="0 = nenhuma · 1 = total"
        />
        <Indicador
          rotulo="Força da sazonalidade"
          valor={formatar(metricas.forca_sazonalidade, 2)}
          dica={`ciclo de ${data.periodo} h · 0 a 1`}
        />
        <Indicador
          rotulo="Ruído (resíduo)"
          valor={`${formatar(metricas.ruido_pct, 1)}%`}
          dica="da variância da série"
        />
        <Indicador
          rotulo="Horas analisadas"
          valor={data.n_horas.toLocaleString("pt-BR")}
          dica={`${data.inicio.slice(0, 10)} a ${data.fim.slice(0, 10)}`}
        />
      </div>

      {/* Avisos */}
      {data.passo_exibicao > 1 && (
        <p className="text-sm italic text-slate-600">
          * Para manter o gráfico leve, é exibido 1 ponto a cada {data.passo_exibicao} horas. Os
          cálculos e os testes usam todas as horas.
        </p>
      )}
      {data.percentual_interpolado > 5 && (
        <p className="rounded-lg border border-[#EF9F27] bg-[#EF9F2722] px-3 py-2 text-sm text-slate-700">
          <b>Atenção:</b> {formatar(data.percentual_interpolado, 1)}% das horas não tinham dados e
          foram preenchidas por interpolação linear. Lacunas grandes podem distorcer a tendência e a
          sazonalidade.
        </p>
      )}

      {/* Gráfico */}
      {options && <HighchartsReact highcharts={Highcharts} options={options} />}

      {/* Estacionariedade */}
      <div className="rounded-lg border border-brand-border bg-brand-soft p-4 text-sm">
        <div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
          <strong className="text-slate-800">Estacionariedade (série em média horária)</strong>
          <span className="text-slate-600">
            Ordem de diferenciação sugerida para o ARIMA:{" "}
            <b className="text-brand">d = {dSugerido}</b>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] bg-white text-sm">
            <thead>
              <tr className="border-b border-line bg-page text-xs uppercase tracking-wide text-slate-600">
                <th className="px-3 py-2 text-left font-semibold">Série</th>
                <th className="px-3 py-2 text-center font-semibold">ADF (estat.)</th>
                <th className="px-3 py-2 text-center font-semibold">ADF (p)</th>
                <th className="px-3 py-2 text-center font-semibold">KPSS (estat.)</th>
                <th className="px-3 py-2 text-center font-semibold">KPSS (p)</th>
                <th className="px-3 py-2 text-center font-semibold">Conclusão</th>
              </tr>
            </thead>
            <tbody>
              <LinhaTeste rotulo="Original" teste={estacionariedade.original} />
              <LinhaTeste rotulo="Após 1ª diferença" teste={estacionariedade.diferenciada} />
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-slate-600">
          <strong>Como ler:</strong> o ADF tem como hipótese nula a presença de raiz unitária (série
          não estacionária); o KPSS tem como hipótese nula a estacionariedade. A série é considerada
          estacionária quando o ADF rejeita a hipótese nula (p &lt; 0,05) e o KPSS não rejeita
          (p ≥ 0,05); quando discordam, o resultado é inconclusivo. Em séries muito longas, o KPSS
          tende a rejeitar mesmo para desvios pequenos.
        </p>
        <p className="mt-2 text-slate-600">
          <strong>Sugestão:</strong> com sazonalidade diurna de {data.periodo} h, considere um modelo
          SARIMA(p, {dSugerido}, q)(P, D, Q)[{data.periodo}].
        </p>
      </div>
    </div>
  );
}