import React, { useState, useEffect } from "react";
import { useCSVReader } from "react-papaparse";

// Importando os componentes de gráficos
import Inicio from "./Inicio";
import SerieSpeed from "./SerieSpeed";
import SerieDirection from "./SerieDirection";
import WindRose from './WindRose';
import HeatMap from './HeatMap';
import ChartHistogram from "./ChartHistogram";
import SpiralChart from "./SpiralChart"
import SerieSuavizada from "./SerieSuavizada";
import StickPlot from "./StickPlot";

import { Link } from "react-router-dom"; // Importe o Link do React Router


import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Slider } from "@mui/material"; // Slider para o filtro de velocidade
import '../App.css';
import '../Styles/dashboard.css';
import '../Styles/table.css';
import '../Styles/charts.css';
import axios from 'axios';

const styles = {
  csvReader: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 10
  },
  browseFile: {
    width: "20%"
  },
  acceptedFile: {
    border: "1px solid #ccc",
    height: 45,
    lineHeight: 2.5,
    paddingLeft: 10,
    width: "80%"
  },
  remove: {
    borderRadius: 0,
    padding: "0 20px"
  },
  progressBarBackgroundColor: {
    backgroundColor: "red"
  }
};

export default function CSVReader() {
  const { CSVReader } = useCSVReader();
  const [csvData, setCsvData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [speedRange, setSpeedRange] = useState([0, 20]); // Intervalo inicial de velocidade ajustado
  const [respostaApi, setRespostaApi] = useState(null); // Estado para armazenar a resposta da API
  
  useEffect(() => {
    console.log("CSV atualizado:", csvData);
  }, [csvData]);


    const enviarParaApi = async (dados) => {
    try {
      // const response = await axios.post('http://localhost:5000/processar', dados);
      const response = await axios.post('https://dashboard-backend-vf4t.onrender.com/processar', dados);
      console.log('Resposta da API:', response.data);
      setRespostaApi(response.data); // Armazena a resposta da API no estado
      console.log('Dados Recebidos da API:', respostaApi);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    }
  };


  // Converter dia, mês e ano para um objeto Date
  const parseDate = (day, month, year) => {
    if (!day || !month || !year) return null;
    const date = new Date(year, month - 1, day); // Quando usa 'Date' -> Janeiro = 0
    return date;
  };

  // Filtrar os dados com base na data e na velocidade
  const displayedData = csvData && (startDate || endDate || speedRange)
    ? csvData.filter(row => {
        // Filtro por data
        const rowDate = parseDate(Number(row["day"]), Number(row["month"]), Number(row["year"]));
        if (startDate && endDate && (!rowDate || rowDate < startDate || rowDate > endDate)) {
          return false;
        }
        if (startDate && (!rowDate || rowDate < startDate)) {
          return false;
        }
        if (endDate && (!rowDate || rowDate > endDate)) {
          return false;
        }

        // Filtro por velocidade
        const speed = parseFloat(row["ws100"]);
        if (speed < speedRange[0] || speed > speedRange[1]) {
          return false;
        }
        // console.log("............................. linha filtrada", row);
        return true; // Inclui a linha se passar em todos os filtros
      })
      : csvData;
      

    
      const filteredSuavizada = respostaApi && (startDate || endDate || speedRange)
      ? respostaApi.filter(row => {
          const dateStr = row[0];
          const value = parseFloat(row[1]);
          const rowDate = new Date(dateStr);
    
          // Ajuste para comparar só a data (ignorando hora)
          let start = startDate ? new Date(startDate) : null;
          let end = endDate ? new Date(endDate) : null;
          if (start) {
            start.setHours(0,0,0,0);
          }
          if (end) {
            end.setHours(23,59,59,999);
          }
    
          if (start && rowDate < start) return false;
          if (end && rowDate > end) return false;
          if (isNaN(value) || value < speedRange[0] || value > speedRange[1]) return false;
    
          return true;
        })
      : respostaApi;






      useEffect(() => {
        console.log("Intervalo selecionado: ", startDate, " até ", endDate);
        console.log("Dados filtrados:", displayedData);
        console.log('Dados Recebidos da API:', respostaApi);
      }, [startDate, endDate, speedRange, displayedData]);
            // Função para filtrar os dados suavizados



  return (
    <>
      {/* <CSVReader
          config={{ header: true }}
          onUploadAccepted={(results) => {
            // Mapeia cada linha para garantir os tipos corretos
            const dataPadronizada = results.data
              .filter(row => row.id && row.ws100 && row.wdir100) // só linhas válidas
              .map(row => ({
              id: row.id,
              year: Number(row.year),
              month: Number(row.month),
              day: Number(row.day),
              hour: Number(row.hour),
              minute: Number(row.minute),
              ws100: Number(String(row.ws100).replace(/"/g, "")),      // Remove aspas e converte para número
              wdir100: Number(String(row.wdir100).replace(/"/g, "")),  // Remove aspas e converte para número
            }));
            setCsvData(dataPadronizada);
            enviarParaApi(dataPadronizada); // Envia para API já padronizado
            
          }}
      > */}
        <CSVReader
          config={{ header: false }}
          onUploadAccepted={(results) => {
            // Mapeamento manual dos índices:
            // 0: id, 1: year, 2: month, 3: day, 4: hour, 5: minute, 6: ws100, 7: wdir100
            const dataPadronizada = results.data
              .filter(row => row[0] && row[6] && row[7])
              .map(row => ({
                id: row[0],
                year: Number(row[1]),
                month: Number(row[2]),
                day: Number(row[3]),
                hour: Number(row[4]),
                minute: Number(row[5]),
                ws100: Number(String(row[6]).replace(/"/g, "")),
                wdir100: Number(String(row[7]).replace(/"/g, "")),
              }));
            setCsvData(dataPadronizada);
            enviarParaApi(dataPadronizada);
          }}
        >
        {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }) => (

                    <>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 0,
                marginBottom: 18,
                background: "#f7faff",
                borderRadius: 12,
                boxShadow: "0 2px 12px #e3e9f7",
                padding: "10px 18px",
                width: "97%",
                margin: "0 0 18px 0"
              }}
            >
              <button
                type="button"
                {...getRootProps()}
                style={{
                  background: "linear-gradient(90deg, #0742e6 60%, #1a237e 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  borderRadius: "8px 0 0 8px",
                  height: 45,
                  width: 260,
                  minWidth: 170,
                  cursor: "pointer",
                  boxShadow: "0 2px 8px #b3c8f9",
                  transition: "background 0.2s",
                  whiteSpace: "nowrap"
                }}
              >
                Selecionar arquivo 
              </button>
              <div
                id="csv"
                style={{
                  border: "1.5px solid #b3c8f9",
                  height: 45,
                  lineHeight: "45px",
                  paddingLeft: 14,
                  paddingRight: 14,
                  width: "100%",
                  background: "#fff",
                  color: "#0742e6",
                  fontWeight: 500,
                  fontSize: 15,
                  borderLeft: "none",
                  borderRight: "none",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}
              >
                {acceptedFile && acceptedFile.name ? acceptedFile.name : "Nenhum arquivo carregado"}
              </div>
              <button
                {...getRemoveFileProps()}
                style={{
                  background: "linear-gradient(90deg, #0742e6 60%, #1a237e 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "none",
                  borderRadius: "0 8px 8px 0",
                  height: 45,
                  padding: "0 28px",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px #e3e9f7",
                  transition: "background 0.2s"
                }}
                onClick={() => setCsvData(null)}
              >
                Início
              </button>
            </div>
            <div style={{ width: "100%", margin: "0 0 10px 0" }}>
              <ProgressBar />
            </div>
                        <div
              style={{
                width: "100%",
                margin: "0 0 10px 0"
              }}
            >
              <ProgressBar />
            </div>
            <div style={{ width: "100%", marginBottom: 12, marginleft: 30, padding: "0 10px" }}>
              <span style={{ fontStyle: "italic", color: "#0742e6", fontSize: 15  }}>
                * O tempo de execução do sistema varia de acordo com a quantidade de dados, aguarde um momento após selecionar o arquivo e alterar os filtros
              </span>
            </div>
          </>
        )}
      </CSVReader>
      {!csvData && <Inicio />}
      {/* Filtro de intervalo de Data */}
                {csvData && (
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #b3c8f9",
              borderRadius: 14,
              boxShadow: "0 4px 24px #e3e9f7",
              padding: "22px 32px 18px 32px",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 28
            }}
          >
            {/* Título do projeto à esquerda */}
            <div style={{
              minWidth: 260,
              fontSize: 22,
              fontWeight: 800,
              color: "#0742e6",
              fontFamily: "'Montserrat', 'Inter', Arial, sans-serif",
              letterSpacing: "1px",
              textShadow: "0 2px 16px #e3e9f7, 0 1px 0 #fff"
            }}>
              Potencial de Geração de Energia Eólica
            </div>
            {/* Filtros alinhados à direita */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 32,
                marginRight: 16
              }}
            >
              {/* Filtro de Data com estilo moderno e info */}
              <div
                style={{
                  background: "#f7faff",
                  border: "1.5px solid #b3c8f9",
                  borderRadius: 10,
                  boxShadow: "0 2px 12px #e3e9f7",
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  minWidth: 270,
                  marginRight: 12,
                  position: "relative"
                }}
              >
                <label style={{
                  color: "#0742e6",
                  fontWeight: 600,
                  fontSize: 15,
                  marginRight: 10,
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap"
                }}>
                  Filtrar por Data:
                </label>
                {/* Info Button para Data */}
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#e3e9f7",
                      color: "#0742e6",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      marginRight: 8,
                      border: "1px solid #b3c8f9"
                    }}
                    title="Selecione o período desejado para análise. Clique primeiro na data inicial."
                  >
                    i
                  </span>
                </span>
                <DatePicker
                  selectsRange
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => {
                    setStartDate(update[0]);
                    setEndDate(update[1]);
                  }}
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Selecione um intervalo"
                  isClearable
                  minDate={new Date(2021, 0, 1)}
                  maxDate={new Date()}
                  scrollableMonthYearDropdown
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                  todayButton="Hoje"
                  popperPlacement="bottom"
                  calendarClassName="modern-datepicker"
                  style={{
                    width: 150,
                    height: 36,
                    border: "1.5px solid #b3c8f9",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 15,
                    color: "#1a237e",
                    background: "#fff",
                    outline: "none",
                    boxShadow: "0 1px 4px #e3e9f7",
                    transition: "border 0.2s"
                  }}
                />
              </div>
              {/* Filtro de Velocidade com box igual ao de data e info */}
              <div
                style={{
                  background: "#f7faff",
                  border: "1.5px solid #b3c8f9",
                  borderRadius: 10,
                  boxShadow: "0 2px 12px #e3e9f7",
                  padding: "12px 18px",
                  display: "flex",
                  alignItems: "center",
                  minWidth: 270,
                  position: "relative"
                }}
              >
                <label style={{
                  color: "#0742e6",
                  fontWeight: 600,
                  fontSize: 15,
                  marginRight: 14,
                  whiteSpace: "nowrap"
                }}>
                  Filtrar por Velocidade (m/s):
                </label>
                {/* Info Button para Velocidade */}
                <span style={{ position: "relative", display: "inline-block" }}>
                  <span
                    style={{
                      display: "inline-block",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#e3e9f7",
                      color: "#0742e6",
                      textAlign: "center",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      marginRight: 8,
                      border: "1px solid #b3c8f9"
                    }}
                    title="Arraste as extremidades do filtro para selecionar as velocidades desejadas."
                  >
                    i
                  </span>
                </span>
                {/* <Slider
                  value={speedRange}
                  onChange={(event, newValue) => setSpeedRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={20}
                  step={0.1}
                  style={{ width: "140px", marginLeft: "0px" }}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 10,
                      height: 16,
                      backgroundColor: '#1a237e',
                      border: '2px solid #1a237e',
                      boxShadow: '0 1px 4px #e3e9f7',
                    },
                    '& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(7,66,230,0.16)',
                    },
                    '& .MuiSlider-track': {
                      color: '#0742e6'
                    },
                    '& .MuiSlider-rail': {
                      color: '#b3c8f9'
                    }
                  }}
                /> */}
                <Slider
                  value={speedRange}
                  onChange={(event, newValue) => setSpeedRange(newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={20}
                  step={0.1}
                  style={{ width: "140px", marginLeft: "0px" }}
                  sx={{
                    '& .MuiSlider-thumb': {
                      width: 10,
                      height: 16,
                      backgroundColor: '#1a237e',
                      border: '2px solid #1a237e',
                      boxShadow: '0 1px 4px #e3e9f7',
                    },
                    '& .MuiSlider-thumb:hover, & .MuiSlider-thumb.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(7,66,230,0.16)',
                    },
                    '& .MuiSlider-track': {
                      color: '#0742e6'
                    },
                    '& .MuiSlider-rail': {
                      color: '#b3c8f9'
                    }
                  }}
                />
              <button
                onClick={() => setSpeedRange([0, 20])}
                style={{
                  marginLeft: 8,
                  background: "none",
                  border: "none",
                  boxShadow: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontSize: 20,
                  color: "#0742e6"
                }}
                title="Retornar filtro de velocidade ao valor inicial"
              >
                <img src={require('../img/undo.png')} alt="Retornar" style={{ width: 22, height: 22, display: "block" }} />
              </button>
              </div>
            </div>
          </div>
        )}
      <div className="general">
        {displayedData && displayedData.length > 0 ? (
          <div className="general-container">
            <div className="chart-container">
              <div className="chart-line">
                <SerieSpeed data={displayedData}/>
              </div>
              <div className="chart-line">
                <SerieSuavizada data={filteredSuavizada} />
              </div>
              <div className="chart-line">
                <SerieDirection data={displayedData} />
              </div>
              <div className="chart-line" id="stick-plot">
                <StickPlot data={displayedData}/>
              </div>
              <div className="chart-top">
                <div className="chart-column">
                  <HeatMap data={displayedData} />
                </div>
                <div className="new-chart">
                  <ChartHistogram data={displayedData} />
                </div>
              </div>
              <div className="chart-top">
                <div className="wind-rose">
                  <WindRose data={displayedData} />
                </div>
                <div className="chart-column">
                  <SpiralChart data={displayedData} />
                </div>
              </div>
              <div >
                <div style={{ marginTop: "24px", textAlign: "center" }}>
                  <div style={{ marginBottom: "8px", fontSize: "1.08rem", color: "#0742e6", fontWeight: 500 }}>
                    Clique para abrir a análise detalhada dos dados em uma nova aba.
                  </div>
                  <button
                    className="btn-analise"
                    onClick={() => {
                      localStorage.setItem("csvData", JSON.stringify(csvData));
                      window.open("/analise", "_blank");
                    }}
                  >
                    Potencial de Geração de Energia
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // <p>{(startDate || endDate || speedRange) ? "Nenhum dado encontrado para este filtro." : "Carregue um arquivo CSV "}</p>
            csvData && displayedData && displayedData.length === 0 ? (
              <p>
                {(startDate || endDate || speedRange[0] !== 0 || speedRange[1] !== 20)
                  ? "Nenhum dado encontrado para este filtro."
                  : "Arquivo CSV carregado, mas não há dados válidos para exibir."}
              </p>
            ) : null
        )}
      </div>
    </>
  );
}

