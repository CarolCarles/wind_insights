import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';

import Card from '../ui/Card';
import InfoBox from '../ui/InfoBox';

if (typeof HighchartsExporting === "function") {
    HighchartsExporting(Highcharts);
}

function SerieSpeed({ data }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (data) {
            console.log("Recebendo data no Chart:", data);

            if (data.length > 0) {
                console.log("Chaves disponíveis:", Object.keys(data[0]));
            }

            const formattedData = data.map(row => [
                row["id"],  // x
                parseFloat(row["ws100"])    // y
            ]).filter(row => row[0] && !isNaN(row[1]));

            console.log("Dados formatados para o gráfico:", formattedData);
            setChartData(formattedData);
        }
    }, [data]);

    const options = {
        chart: {
            type: 'line',
            zoomType: 'x',
        },
        title: {
            text: "Série Temporal da Velocidade do Vento",
        },
        colors: ['#000'],
        xAxis: {
            type: 'datetime', // Define o eixo X como um eixo de tempo
            title: {
                text: 'Data', // Título do eixo X
            },
            dateTimeLabelFormats: {
                //day: '%d/%m/%Y', // Formato para exibir apenas a data
                hour: '%[HM]',
                day: '%[eb]',
                month: '%[bY]',
                year: '%Y'
            },
        },
        yAxis: {
            title: {
                text: 'Velocidade do Vento (m/s)',
            },
        },
        series: [{
            name: 'Velocidade',
            data: chartData,  // Passa os dados formatados
            gapSize: 2, // Define o tamanho do gap
        }],
    };

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
                Clique em "Reset Zoom" para voltar à visualização completa.
            </InfoBox>
        </Card>
    );
}

export default SerieSpeed;