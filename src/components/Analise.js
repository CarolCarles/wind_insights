import React, { useState } from "react";
import AnaliseGoodSpeed from "./AnaliseGoodSpeed";
import CasasAbastecidas from "./CasasAbastecidas";
import ArvoresSalvas from "./ArvoresSalvas";
import AguaEconomizada from "./AguaEconomizada";
import '../Styles/analise.css';

function Analise() {
    let csvData = [];
    try {
        csvData = JSON.parse(localStorage.getItem("csvData")) || [];
    } catch {
        csvData = [];
    }

    // Estados para os inputs
    const [raioTurbinaInput, setRaioTurbinaInput] = useState(40);
    const [eficienciaInput, setEficienciaInput] = useState(0.4);
    const [limiteVelocidadeInput, setLimiteVelocidadeInput] = useState(4);

    // Estados para os valores usados nos cálculos
    const [raioTurbina, setRaioTurbina] = useState(40);
    const [eficiencia, setEficiencia] = useState(0.4);
    const [limiteVelocidade, setLimiteVelocidade] = useState(4);

    // Função chamada ao clicar no botão
    const atualizarParametros = () => {
        setRaioTurbina(Number(raioTurbinaInput) || 40);
        setEficiencia(Number(eficienciaInput) || 0.4);
        setLimiteVelocidade(Number(limiteVelocidadeInput) || 4);
    };

    return (
        <div className="analise-container">
            <h1
                style={{
                    color: "#0742e6",
                    fontWeight: 900,
                    fontSize: 32,
                    letterSpacing: "1.5px",
                    marginBottom: 10,
                    textAlign: "center",
                    fontFamily: "'Montserrat', 'Inter', Arial, sans-serif",
                    textShadow: "0 2px 16px #e3e9f7, 0 1px 0 #fff"
                }}
            >
                Potencial de Geração de Energia Eólica
            </h1>
            <div className="analise-parametros" style={{ marginBottom: 24 }}>
                <h2
                    style={{
                        fontSize: "1rem",
                        marginBottom: 8,
                        color: "#1a237e",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                        textAlign: "left"
                    }}
                >
                    Parâmetros do sistema
                </h2>
                <div
                    style={{
                        display: "flex",
                        gap: 18,
                        flexWrap: "wrap",
                        alignItems: "center",
                        background: "#f7faff",
                        borderRadius: 12,
                        padding: "16px 16px 8px 16px",
                        boxShadow: "0 2px 12px #e3e9f7",
                        marginBottom: 8,
                        justifyContent: "flex-start"
                    }}
                >
                    <label style={{ color: "#0742e6", fontWeight: 500 }}>
                        Raio da turbina (m):  
                        <input
                            type="number"
                            value={raioTurbinaInput}
                            min={1}
                            onChange={e => setRaioTurbinaInput(e.target.value)}
                            style={{
                                width: 80,
                                height: 30,
                                border: "1.5px solid #b3c8f9",
                                borderRadius: 6,
                                padding: "0 8px",
                                fontSize: 15,
                                color: "#1a237e",
                                background: "#fff",
                                outline: "none",
                                boxShadow: "0 1px 4px #e3e9f7",
                                marginRight: 8,
                                marginLeft: 5,
                                transition: "border 0.2s"
                            }}
                            />
                    </label>
                    <label style={{ color: "#0742e6", fontWeight: 500 }}>
                        Eficiência da turbina:  
                        <input
                            type="number"
                            step="0.01"
                            value={eficienciaInput}
                            min={0}
                            max={1}
                            onChange={e => setEficienciaInput(e.target.value)}
                            style={{
                                width: 80,
                                height: 30,
                                border: "1.5px solid #b3c8f9",
                                borderRadius: 6,
                                padding: "0 8px",
                                fontSize: 15,
                                color: "#1a237e",
                                background: "#fff",
                                outline: "none",
                                boxShadow: "0 1px 4px #e3e9f7",
                                marginRight: 8,
                                marginLeft: 5,
                                transition: "border 0.2s"
                            }}
                        />
                    </label>
                    <label style={{ color: "#0742e6", fontWeight: 500 }}>
                        Velocidade mínima (m/s):  
                        <input
                            type="number"
                            step="0.01"
                            value={limiteVelocidadeInput}
                            min={0}
                            onChange={e => setLimiteVelocidadeInput(e.target.value)}
                            style={{
                                width: 80,
                                height: 30,
                                border: "1.5px solid #b3c8f9",
                                borderRadius: 6,
                                padding: "0 8px",
                                fontSize: 15,
                                color: "#1a237e",
                                background: "#fff",
                                outline: "none",
                                boxShadow: "0 1px 4px #e3e9f7",
                                marginRight: 8,
                                marginLeft: 5,
                                transition: "border 0.2s"
                            }}
                        />
                    </label>
                    <button
                        style={{
                            height: 34,
                            marginLeft: 20,
                            background: "linear-gradient(90deg, #0742e6 60%, #1a237e 100%)",
                            color: "#fff",
                            border: "none",
                            borderRadius: 6,
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 16,
                            padding: "0 22px",
                            boxShadow: "0 2px 8px #e3e9f7",
                            transition: "background 0.2s",                            
                        }}
                        onClick={atualizarParametros}
                    >
                        Atualizar
                    </button>
                </div>
            </div>
            <div className="analise-content">
                <div className="analise-left">
                    <AnaliseGoodSpeed data={csvData} limiteVelocidade={limiteVelocidade} />
                </div>
                <div className="analise-right">
                    <CasasAbastecidas data={csvData} raioTurbina={raioTurbina} eficiencia={eficiencia} />
                    <ArvoresSalvas data={csvData} raioTurbina={raioTurbina} eficiencia={eficiencia} />
                    <AguaEconomizada data={csvData} raioTurbina={raioTurbina} eficiencia={eficiencia} />
                </div>
            </div>
            <footer
                style={{
                    marginTop: 32,
                    padding: "18px 16px 10px 16px",
                    background: "#f4f7fb",
                    borderRadius: 10,
                    color: "#1a237e",
                    fontSize: 15,
                    boxShadow: "0 2px 8px #e3e9f7",
                    textAlign: "center",
                    maxWidth: 800,
                    marginLeft: "auto",
                    marginRight: "auto"
                }}
            >
                {/* <b>Parâmetros utilizados nos cálculos:</b><br />
                Raio da turbina: <b style={{ color: "#0742e6" }}>{raioTurbina} m</b> &nbsp;|&nbsp;
                Eficiência: <b style={{ color: "#0742e6" }}>{eficiencia}</b> &nbsp;|&nbsp;
                Velocidade mínima considerada: <b style={{ color: "#0742e6" }}>{limiteVelocidade} m/s</b> */}
                <b>Dados utilizado para realizar os cálculos:</b><br />
                Raio da turbina: <b style={{ color: "#0742e6" }}>{raioTurbina} m</b> &nbsp;|&nbsp;
                Eficiência: <b style={{ color: "#0742e6" }}>{eficiencia}</b> &nbsp;|&nbsp;
                Velocidade mínima considerada: <b style={{ color: "#0742e6" }}>{limiteVelocidade} m/s</b> &nbsp;|&nbsp;
                Densidade do ar: <b style={{ color: "#0742e6" }}>1.225 kg/m³</b> &nbsp;|&nbsp;
                Área varrida pelas pás: <b style={{ color: "#0742e6" }}>{(Math.PI * Math.pow(raioTurbina, 2)).toFixed(2)} m²</b> &nbsp;|&nbsp;
                Consumo médio mensal por casa: <b style={{ color: "#0742e6" }}>300 kWh</b>
            </footer>
        </div>
    );
}

export default Analise;