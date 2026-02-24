import React from "react";

function Inicio() {
  return (
    <div
      style={{
        maxWidth: 540,
        margin: "40px auto",
        padding: 32,
        background: "linear-gradient(135deg, #f4f7fb 70%, #e3e9f7 100%)",
        borderRadius: 18,
        boxShadow: "0 4px 24px rgba(7,66,230,0.08)",
        fontSize: 17,
        fontFamily: "Inter, Arial, sans-serif",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 18,
        }}
      >
        <span
          style={{
            background: "linear-gradient(90deg,rgb(52, 101, 238) 60%,rgb(55, 65, 170) 100%)",
            color: "#fff",
            fontWeight: 900,
            fontSize: 44,
            padding: "12px 36px",
            borderRadius: 18,
            boxShadow: "0 4px 24px #b3c8f9",
            fontFamily: "'Montserrat', 'Inter', Arial, sans-serif",
            textShadow: "0 2px 16px #0742e6cc, 0 1px 0 #fff",
            border: "3px solid #fff",
            textTransform: "uppercase",
            letterSpacing: "2px",
            userSelect: "none",
            display: "block",
          }}
        >
          <span style={{ fontWeight: 900, fontSize: 54 }}>W</span>ind&nbsp;
          <span style={{ fontWeight: 900, fontSize: 54 }}>I</span>nsights
        </span>
      </div>

      <h2
        style={{
          color: "#1a237e",
          fontWeight: 600,
          fontSize: 22,
          marginBottom: 18,
        }}
      >
        Análise de Dados de Vento
      </h2>

      <div style={{display: "flex", justifyContent: "center", flexDirection: "column", margin: "0 18px 0 18px"}}>
        <b style={{ color: "#0742e6", textAlign: "left" }}>Como usar:</b>
        <ol style={{ lineHeight: 1.7, textAlign: "left" }}>
          <li>Faça upload do seu arquivo CSV.</li>
          <li>Defina o mapeamento das colunas.</li>
          <li>Use os filtros para explorar os dados.</li>
          <li>Veja os gráficos gerados automaticamente.</li>
        </ol>
      </div>

      <div
        style={{
          color: "#0742e6",
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        Formato recomendado:
      </div>

      <div
        style={{
          background: "#fff",
          padding: 10,
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 15,
          marginTop: 9,
          display: "inline-block",
        }}
      >
        timestamp,velocidade,direcao
        <br />
        2021-09-16 18:00:00,8.51,53.95
      </div>
    </div>
  );
}

export default Inicio;