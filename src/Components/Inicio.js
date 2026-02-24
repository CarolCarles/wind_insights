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
            letterSpacing: "-2px",
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
          <span style={{ fontWeight: 900, fontSize: 54, letterSpacing: "4px" }}>W</span>ind&nbsp;
          <span style={{ fontWeight: 900, fontSize: 54, letterSpacing: "4px" }}>I</span>nsights
        </span>
      </div>
      <h2
        style={{
          color: "#1a237e",
          fontWeight: 600,
          fontSize: 22,
          marginBottom: 18,
          textAlign: "center",
          letterSpacing: "0.5px",
        }}
      >
        Análise de Dados de Vento
      </h2>
      <div style={{ marginBottom: 18, display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
        <b style={{ color: "#0742e6", marginRight: 8, marginTop: 2 }}>Como usar:</b>
        <ol style={{ margin: 0, lineHeight: 1.7, textAlign: "left" }}>
          <li>Faça upload do seu arquivo CSV.</li>
          <li>Use os filtros para explorar os dados.</li>
          <li>Veja os gráficos gerados automaticamente.</li>
        </ol>
      </div>
      <div
        style={{
          margin: "18px 0 6px 0",
          color: "#0742e6",
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        Ordem necessária das colunas:
      </div>
      <div
        style={{
          background: "rgb(255, 255, 255)",
          padding: 10,
          borderRadius: 8,
          fontFamily: "monospace",
          fontSize: 16,
          marginBottom: 6,
          color: "#222",
          display: "inline-block",
        }}
      >
        "Id","Ano","Mês","Dia","Hora","Minutos","Velocidade","Direcao"
      </div>
      <div style={{ fontSize: 14, color: "#444", marginBottom: 18 }}>
        <b>Id</b> representa o <b>timestamp</b> único de cada registro. Contendo as informações de data agrupadas.
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #e3e9f7",
          borderRadius: 8,
          padding: 10,
          fontFamily: "monospace",
          fontSize: 15,
          color: "#333",
          boxShadow: "0 2px 8px #f4f7fb",
          display: "inline-block",
        }}
      >
        Exemplo de linha de dados:<br />
        <span style={{ color: "#0742e6" }}>
          "2021-09-16 18:00:00",2021,9,16,18,0,"8.51","53.95"
        </span>
      </div>
    </div>
  );
}

export default Inicio;