import React, { useMemo, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import highchartsMore from "highcharts/highcharts-more";

import Card from "../ui/Card";
import Button from "../ui/Button";

// O tipo de série "arearange" (faixa sombreada) não vem no core do
// Highcharts — precisa habilitar o módulo "highcharts-more" antes de usar.
//
// Dependendo da versão do Highcharts/Webpack, esse import pode vir como
// função direta OU como um objeto { default: fn } (interop de CJS/ESM).
// Tratamos os dois formatos para evitar o erro "is not a function".
if (typeof highchartsMore === "function") {
    highchartsMore(Highcharts);
} else if (highchartsMore && typeof highchartsMore.default === "function") {
    highchartsMore.default(Highcharts);
}

// Agrupa os valores de velocidade (ws100) pelo campo indicado ("month" ou
// "hour") e calcula média + desvio padrão amostral (ddof=1) em cada bucket.
// `bucketCount` e `bucketOffset` ajustam o intervalo (mês vai de 1-12,
// hora vai de 0-23).
function computeProfile(data, field, bucketCount, bucketOffset) {
    const buckets = Array.from({ length: bucketCount }, () => []);

    (data || []).forEach((row) => {
        const rawValue = Number(row[field]);
        const speed = Number(row.ws100);

        if (isNaN(rawValue) || isNaN(speed)) return;

        const idx = rawValue - bucketOffset;
        if (idx < 0 || idx >= bucketCount) return;

        buckets[idx].push(speed);
    });

    const meanSeries = [];
    const bandSeries = [];

    buckets.forEach((values, idx) => {
        const x = idx + bucketOffset;

        if (values.length === 0) {
            meanSeries.push([x, null]);
            bandSeries.push([x, null, null]);
            return;
        }

        const n = values.length;
        const mean = values.reduce((acc, v) => acc + v, 0) / n;

        // Desvio padrão amostral (n-1). Com só 1 ponto no bucket, não dá pra
        // calcular variância — a faixa colapsa na própria média nesse caso.
        const variance = n > 1
            ? values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (n - 1)
            : 0;
        const std = Math.sqrt(variance);

        meanSeries.push([x, Number(mean.toFixed(2))]);
        bandSeries.push([
            x,
            Number((mean - std).toFixed(2)),
            Number((mean + std).toFixed(2))
        ]);
    });

    return { meanSeries, bandSeries };
}

const VIEW_CONFIG = {
    hourly: {
        field: "hour",
        bucketCount: 24,
        bucketOffset: 0,
        xAxisTitle: "Hora do dia",
        chartTitle: "Ciclo Diurno da Velocidade do Vento",
        buttonLabel: "Perfil Horário"
    },
    monthly: {
        field: "month",
        bucketCount: 12,
        bucketOffset: 1,
        xAxisTitle: "Mês",
        chartTitle: "Ciclo Anual da Velocidade do Vento",
        buttonLabel: "Perfil Mensal"
    }
};

export default function ProfileChart({ data }) {
    const [viewMode, setViewMode] = useState("hourly");

    const config = VIEW_CONFIG[viewMode];

    const { meanSeries, bandSeries } = useMemo(
        () => computeProfile(data, config.field, config.bucketCount, config.bucketOffset),
        [data, config.field, config.bucketCount, config.bucketOffset]
    );

    const options = {
        chart: {
            type: "line",
            backgroundColor: "transparent",
            style: { fontFamily: "Inter, Arial, sans-serif" }
        },
        title: { text: config.chartTitle },
        xAxis: {
            title: { text: config.xAxisTitle },
            tickInterval: 1,
            min: config.bucketOffset,
            max: config.bucketOffset + config.bucketCount - 1,
            gridLineWidth: 1,
            gridLineColor: "#f0f0f0"
        },
        yAxis: {
            title: { text: "Velocidade (m/s)" },
            gridLineColor: "#f0f0f0"
        },
        tooltip: {
            shared: true,
            valueSuffix: " m/s",
            valueDecimals: 2
        },
        legend: { enabled: true },
        credits: { enabled: true },
        series: [
            {
                name: "Faixa (média ± desvio padrão)",
                type: "arearange",
                data: bandSeries,
                color: "#b3c8f9",
                fillOpacity: 0.4,
                lineWidth: 0,
                marker: { enabled: false },
                zIndex: 0
            },
            {
                name: "Velocidade média",
                type: "line",
                data: meanSeries,
                color: "#0742e6",
                lineWidth: 2,
                marker: { enabled: false },
                zIndex: 1
            }
        ]
    };

    // A aba ativa fica com o visual "primário" e desabilitada (como no original).
    // "disabled:!opacity-100" evita que o botão ativo fique esmaecido.
    const botoes = (
        <>
            <Button
                size="sm"
                variant={viewMode === "hourly" ? "solid" : "secondary"}
                className="disabled:!opacity-100"
                onClick={() => setViewMode("hourly")}
                disabled={viewMode === "hourly"}
                title={viewMode === "hourly" ? "Exibindo perfil horário" : "Ver perfil horário"}
            >
                Perfil Horário
            </Button>

            <Button
                size="sm"
                variant={viewMode === "monthly" ? "solid" : "secondary"}
                className="disabled:!opacity-100"
                onClick={() => setViewMode("monthly")}
                disabled={viewMode === "monthly"}
                title={viewMode === "monthly" ? "Exibindo perfil mensal" : "Ver perfil mensal"}
            >
                Perfil Mensal
            </Button>
        </>
    );

    return (
        <Card action={botoes}>
            {meanSeries.length > 0 ? (
                <HighchartsReact highcharts={Highcharts} options={options} />
            ) : (
                <p className="py-6 text-center text-slate-500">Carregando gráfico...</p>
            )}
        </Card>
    );
}