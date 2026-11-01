import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';

import Card from '../ui/Card';
import InfoBox from '../ui/InfoBox';

if (typeof HighchartsExporting === "function") {
    HighchartsExporting(Highcharts);
}

function SerieSuavizada({ data }) {

    const chartData = React.useMemo(() => {
        if (!data) return [];

        return data.map(row => [
            typeof row[0] === "string"
                ? Date.parse(row[0])
                : row[0],
            Number(row[1])
        ]).filter(row => row[0] && !isNaN(row[1]));

    }, [data]);

    const options = React.useMemo(() => ({
        chart: {
            type: 'line',
            zoomType: 'x',
        },
        title: {
            text: "Série Suavizada com Média Móvel de 6 Passos",
        },
        colors: ['#000'],
        xAxis: {
            type: 'datetime',
            title: { text: 'Data' },
        },
        yAxis: {
            title: { text: 'Velocidade (m/s)' },
        },
        series: [{
            name: 'Velocidade Suavizada',
            data: chartData,
        }],
    }), [chartData]);

    return (
        <Card>
            {chartData.length > 0 ? (
                <HighchartsReact highcharts={Highcharts} options={options} />
            ) : (
                <p className="py-6 text-center text-slate-500">Carregando gráfico...</p>
            )}

            <InfoBox>
                <b>Dica:</b> Passe o mouse sobre o gráfico para ver os valores de cada ponto.<br />
                Selecione uma área do gráfico para dar zoom.<br />
                Clique em "Reset Zoom" para voltar à visualização completa.<br />
                <i className="text-xs text-brand"> ** Por conta do tamanho do CSV e dos cálculos necessários, este gráfico pode demorar a carregar.</i>
            </InfoBox>
        </Card>
    );
}

export default SerieSuavizada;