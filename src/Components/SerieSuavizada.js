import React, { useState, useEffect } from 'react';
import Highcharts, { color } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsExporting from 'highcharts/modules/exporting';

import '../Styles/serieSuavizada.css';

if (typeof HighchartsExporting === "function") {
    HighchartsExporting(Highcharts);
}

function SerieSuavizada({ data }) {
    const [chartData, setChartData] = useState([]);

        // Esse funciona com timestamps
                useEffect(() => {
            if (data) {
                // Converte o primeiro elemento (data/hora) para timestamp
                const formattedData = data
                    .map(row => [
                        typeof row[0] === "string" ? new Date(row[0]).getTime() : row[0],
                        Number(row[1])
                    ])
                    .filter(row => row[0] && !isNaN(row[1]));
                setChartData(formattedData);
                console.log("-- >>> DADOS SMOOTHING: <<< ---", data);
                console.log("-- >>> DADOS SMOOTHING formatados: <<< ---", formattedData);

            }
        }, [data]);

    
        const options = {
        chart: {
            type: 'line',
            zoomType: 'x',
        },
        title: {
            text: "Série Suavizada com Média Móvel de 6 Passos",
        },
        colors: ['#000'],
        xAxis: {
            type: 'datetime', // Define o eixo X como um eixo de tempo
            title: {
                text: 'Data', // Título do eixo X
            },
            // dateTimeLabelFormats: {
            //     //day: '%d/%m/%Y', // Formato para exibir apenas a data
            //     // hour: '%[HM]',
            //     day: '%[eb]',
            //     month: '%[bY]',
            //     year: '%Y'
            // },
        },
        yAxis: {
            title: {
                text: 'Velocidade (m/s)',
            },
        },
        series: [{
            name: 'Velocidade Suavizada',
            data: chartData,  // Passa os dados formatados diretamente
        }],
    };

    return (
        <div className='return'>
            <h2>Série Suavizada da Velocidade do Vento</h2>
            <div
                style={{
                    background: "#f7faff",
                    border: "1px solid #b3c8f9",
                    borderRadius: 8,
                    padding: "10px 16px",
                    marginBottom: 12,
                    color: "#0742e6",
                    fontSize: 15,
                    marginLeft: "auto",      // Faz a caixa ir para a direita
                    textAlign: "right",      // Alinha o texto à direita
                    width: "fit-content"     // Só ocupa o necessário
                }}
            >
                <b>Dica:</b> Passe o mouse sobre o gráfico para ver os valores de cada ponto.<br />
                Selecione uma área do gráfico para dar zoom.<br />
                Clique em "Reset Zoom" para voltar à visualização completa.<br />
                <i style={{color:"#1a237e", fontSize: 12}}> ** Por conta do tamanho do CSV e dos cálculos necessários, este gráfico pode demorar a carregar.</i> 
            </div>
            {chartData.length > 0 ? ( // Verifica se o CSV não está vazio (errado)
                <HighchartsReact highcharts={Highcharts} options={options} /> // True
            ) : (
                <p>Carregando gráfico...</p> // False
            )}
        </div>
    );
}

export default SerieSuavizada;

