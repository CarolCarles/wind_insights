import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

function Chart({ data }) {
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        if (data) {
            console.log("Recebendo data no Chart:", data);
    
            if (data.length > 0) {
                console.log("Chaves disponíveis:", Object.keys(data[0]));
            }

            const formattedData = data.map(row => [ 
                row["id"],  // x
                parseFloat(row["wdir100"])    // y
            ]).filter(row => row[0] && !isNaN(row[1]));
    
            console.log("Dados series direction:", formattedData);
            setChartData(formattedData);
        }
    }, [data]);
    

    const options = {
        chart: {
            type: 'line',
            zoomType: 'x',
        },
        title: {
            text: " ",
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
                text: 'Direção (Graus)',
            },
        },
        series: [{
            name: 'Direção',
            data: chartData,  // Passa os dados formatados (Padrao CSV)
        }],
    };

    return (
        <div className='return'>
            <h2>Série Temporal da Direção do Vento</h2>
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
                Clique em "Reset Zoom" para voltar à visualização completa.
            </div>
            {chartData.length > 0 ? ( // Verifica se o CSV não está vazio (errado)
                <HighchartsReact highcharts={Highcharts} options={options} /> // True
            ) : (
                <p>Carregando gráfico...</p> // False
            )}
        </div>
    );
}

export default Chart;