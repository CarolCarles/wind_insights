import React from "react";

export default function ColumnMapper({ headers, onConfirm }) {
    const [mapping, setMapping] = React.useState({});

    const campos = [
        { key: "timestamp", label: "Timestamp" },
        { key: "ws100", label: "Velocidade do vento" },
        { key: "wdir100", label: "Direção do vento" },
        { key: "year", label: "Ano" },
        { key: "month", label: "Mês" },
        { key: "day", label: "Dia" },
        { key: "hour", label: "Hora" },
        { key: "minute", label: "Minuto" },
    ];

    const isValidMapping = () => {
        const hasWind =
            mapping.ws100 !== undefined &&
            mapping.wdir100 !== undefined;

        const hasTimestamp =
            mapping.timestamp !== undefined;

        const hasDateParts =
            mapping.year !== undefined &&
            mapping.month !== undefined &&
            mapping.day !== undefined;

        const hasHour =
            mapping.hour !== undefined;

        return hasWind && (hasTimestamp || hasDateParts || hasHour);
    };

    return (
        <div style={{
            maxWidth: 540,
            margin: "40px auto",
            padding: 32,
            background: "linear-gradient(135deg, #f4f7fb 70%, #e3e9f7 100%)",
            borderRadius: 18,
            boxShadow: "0 4px 24px rgba(7,66,230,0.08)",
            fontSize: 17,
            fontFamily: "Inter, Arial, sans-serif",
            textAlign: "center",
        }}>
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
                Mapeamento de Colunas
            </h2>

            <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", margin: "0 18px 0 18px" }}>
                <b style={{ color: "#0742e6", textAlign: "left" }}>Informar velocidade, direção e uma informação de tempo:</b>
                <ol style={{ lineHeight: 1.7, textAlign: "left" }}>
                    {campos.map(campo => (
                        <div key={campo.key}>
                            <label>{campo.label}: </label>
                            <select
                                value={mapping[campo.key] ?? ""}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setMapping({
                                        ...mapping,
                                        [campo.key]: value === "" ? undefined : Number(value)
                                    });
                                }}
                                style={{
                                    background: "#f7faff",
                                    border: "1.5px solid #b3c8f9",
                                    borderRadius: 10,
                                    boxShadow: "0 2px 12px #e3e9f7",
                                    padding: "3px 3px",
                                    alignItems: "center",
                                    position: "relative"
                                }}
                            >
                                <option value="">-- selecionar --</option>
                                {headers.map((h, i) => (
                                    <option key={i} value={i} >
                                        {h || `Coluna ${i + 1}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ))}
                </ol>
            </div>

            <button
                onClick={() => onConfirm(mapping)}
                disabled={!isValidMapping()}
                style={{
                    background: "linear-gradient(90deg, #0742e6 60%, #1a237e 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    border: "none",
                    borderRadius: "8px",
                    height: 45,
                    width: 260,
                    minWidth: 170,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px #b3c8f9",
                    transition: "background 0.2s",
                    whiteSpace: "nowrap",
                    opacity: isValidMapping() ? 1 : 0.5,
                    cursor: isValidMapping() ? "pointer" : "not-allowed"
                }}
            >
                Confirmar
            </button>
        </div>
    );
}