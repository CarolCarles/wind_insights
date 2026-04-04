import React from "react";

export default function ColumnMapper({ headers, hasHeaderDetected, rawRows, onHeaderToggle, onConfirm }) {
    const [mapping, setMapping] = React.useState({});
    const [userHasHeader, setUserHasHeader] = React.useState(hasHeaderDetected ?? true);

    const separateTimeFields = ["year", "month", "day", "hour", "minute"];
    const windMapped = mapping.ws100 !== undefined && mapping.wdir100 !== undefined;
    const timestampMapped = mapping.timestamp !== undefined;
    const hasFullSeparateTime =
        mapping.year !== undefined &&
        mapping.month !== undefined &&
        mapping.day !== undefined &&
        mapping.hour !== undefined &&
        mapping.minute !== undefined;
    const separateTimeMapped = separateTimeFields.some(k => mapping[k] !== undefined);

    const validation = {
        wind: windMapped,
        time: timestampMapped || hasFullSeparateTime,
    };
    const isValid = validation.wind && validation.time;

    const campos = [
        {
            key: "ws100",
            label: "Velocidade do vento",
            group: "wind",
            disabledWhen: false,
        },
        {
            key: "wdir100",
            label: "Direção do vento",
            group: "wind",
            disabledWhen: false,
        },
        {
            key: "timestamp",
            label: "Timestamp",
            group: "time",
            disabledWhen: separateTimeMapped,
            disabledReason: "Limpe os campos Ano/Mês/Dia/Hora/Minuto para usar Timestamp",
        },
        {
            key: "year",
            label: "Ano",
            group: "separate",
            disabledWhen: timestampMapped,
            disabledReason: "Limpe o campo Timestamp para usar campos separados",
        },
        {
            key: "month",
            label: "Mês",
            group: "separate",
            disabledWhen: timestampMapped,
            disabledReason: "Limpe o campo Timestamp para usar campos separados",
        },
        {
            key: "day",
            label: "Dia",
            group: "separate",
            disabledWhen: timestampMapped,
            disabledReason: "Limpe o campo Timestamp para usar campos separados",
        },
        {
            key: "hour",
            label: "Hora",
            group: "separate",
            disabledWhen: timestampMapped,
            disabledReason: "Limpe o campo Timestamp para usar campos separados",
        },
        {
            key: "minute",
            label: "Minuto",
            group: "separate",
            disabledWhen: timestampMapped,
            disabledReason: "Limpe o campo Timestamp para usar campos separados",
        },
    ];

    const handleHeaderToggle = (checked) => {
        setUserHasHeader(checked);
        // Limpa mapeamento ao trocar, pois os índices/nomes podem mudar
        setMapping({});
        if (onHeaderToggle) onHeaderToggle(checked);
    };

    const handleChange = (key, value) => {
        setMapping(prev => ({
            ...prev,
            [key]: value === "" ? undefined : Number(value),
        }));
    };

    // Limpa o campo oposto ao que o usuário acabou de preencher
    const handleChangeWithMutualExclusion = (key, value) => {
        const isTimestamp = key === "timestamp";
        const isSeparate = separateTimeFields.includes(key);

        setMapping(prev => {
            const next = { ...prev, [key]: value === "" ? undefined : Number(value) };

            // Se preencheu timestamp, limpa campos separados
            if (isTimestamp && value !== "") {
                separateTimeFields.forEach(k => { delete next[k]; });
            }

            // Se preencheu campo separado, limpa timestamp
            if (isSeparate && value !== "") {
                delete next.timestamp;
            }

            return next;
        });
    };

    // Agrupa campos para renderização com separador visual
    const windFields = campos.filter(c => c.group === "wind");
    const timeField = campos.find(c => c.key === "timestamp");
    const separateFields = campos.filter(c => c.group === "separate");

    const renderSelect = (campo) => {
        const isDisabled = campo.disabledWhen;
        return (
            <div
                key={campo.key}
                style={{
                    display: "flex",
                    alignItems: "center",
                    opacity: isDisabled ? 0.4 : 1,
                    transition: "opacity 0.2s",
                }}
                title={isDisabled ? campo.disabledReason : ""}
            >
                <label
                    style={{
                        minWidth: 230,
                        textAlign: "left",
                        color: "#1a237e",
                        fontSize: 15,
                        fontWeight: 600,
                    }}
                >
                    {campo.label}
                </label>
                <select
                    value={mapping[campo.key] ?? ""}
                    disabled={isDisabled}
                    onChange={(e) => handleChangeWithMutualExclusion(campo.key, e.target.value)}
                    style={{
                        background: isDisabled ? "#f0f0f0" : "#f7faff",
                        border: "1.5px solid #b3c8f9",
                        borderRadius: 10,
                        boxShadow: "0 2px 12px #e3e9f7",
                        padding: "4px 8px",
                        fontSize: 14,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        minWidth: 160,
                    }}
                >
                    <option value="">-- selecionar --</option>
                    {headers.map((h, i) => (
                        <option key={i} value={i}>
                            {h || `Coluna ${i + 1}`}
                        </option>
                    ))}
                </select>
            </div>
        );
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
                Mapeamento de Dados
            </h2>

            {/* ── Checkbox ── */}
            <div
                style={{
                    background: "#f7faff",
                    border: "1.5px solid #b3c8f9",
                    borderRadius: 10,
                    padding: "10px 14px",
                    margin: "0 8px 20px 8px",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    justifyContent: "flex-start",
                    transition: "background 0.2s, border 0.2s",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <input
                        type="checkbox"
                        id="hasHeader"
                        checked={userHasHeader}
                        onChange={(e) => handleHeaderToggle(e.target.checked)}
                        style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#0742e6" }}
                    />
                    <label
                        htmlFor="hasHeader"
                        style={{
                            color: "#1a237e",
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: "pointer",
                            userSelect: "none"
                        }}
                    >
                        {userHasHeader
                            ? "Arquivo tem cabeçalho"
                            : "Arquivo não tem cabeçalho"}
                    </label>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", margin: "0 8px" }}>
                {/* ── Campos de vento ── */}
                <div>
                    <div
                        style={{
                            color: "#0742e6",
                            fontWeight: 700,
                            textAlign: "left",
                            fontSize: 14,
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        Dados de Vento — preencha os campos abaixo:
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            background: windMapped ? "#e8f5e9" : "#f7faff",
                            border: `1.5px solid ${windMapped ? "#a5d6a7" : "#b3c8f9"}`,
                            borderRadius: 10,
                            padding: "10px 14px",
                            transition: "background 0.2s, border 0.2s",
                        }}
                    >
                        {windFields.map(renderSelect)}
                    </div>
                </div>

                {/* ── Divisor ── */}
                <div
                    style={{
                        borderTop: "1.5px dashed #b3c8f9",
                        margin: "10px 0 10px 0",
                    }}
                />

                {/* ── Timestamp único ── */}
                <div>
                    <div
                        style={{
                            color: "#0742e6",
                            fontWeight: 700,
                            textAlign: "left",
                            fontSize: 14,
                            marginBottom: 6,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                        }}
                    >
                        Tempo — escolha e preencha uma das opções abaixo:
                    </div>

                    {/* Opção A: Timestamp */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            background: timestampMapped ? "#e8f5e9" : "#f7faff",
                            border: `1.5px solid ${timestampMapped ? "#a5d6a7" : "#b3c8f9"}`,
                            borderRadius: 10,
                            padding: "10px 14px",
                            transition: "background 0.2s, border 0.2s",
                        }}
                    >
                        {renderSelect(timeField)}
                    </div>

                    {/* Divisor "OU" */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "10px 0 10px 0" }}>
                        <div style={{ flex: 1, height: 1, background: "#b3c8f9" }} />
                        <span style={{ color: "#7986cb", fontWeight: 700, fontSize: 14 }}>OU</span>
                        <div style={{ flex: 1, height: 1, background: "#b3c8f9" }} />
                    </div>

                    {/* Opção B: Campos separados */}
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 8,
                            background: separateTimeMapped ? "#e8f5e9" : "#f7faff",
                            border: `1.5px solid ${separateTimeMapped ? "#a5d6a7" : "#b3c8f9"}`,
                            borderRadius: 10,
                            padding: "10px 14px",
                            transition: "background 0.2s, border 0.2s",
                        }}
                    >
                        {separateFields.map(renderSelect)}
                    </div>
                </div>
            </div>

            <button
                onClick={() => onConfirm(mapping)}
                disabled={!isValid}
                style={{
                    background: "linear-gradient(90deg, #0742e6 60%, #1a237e 100%)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 16,
                    border: "none",
                    borderRadius: "8px",
                    height: 45,
                    width: 260,
                    marginTop: "10px",
                    minWidth: 170,
                    cursor: "pointer",
                    boxShadow: "0 2px 8px #b3c8f9",
                    transition: "background 0.2s",
                    whiteSpace: "nowrap",
                    opacity: isValid ? 1 : 0.5,
                    cursor: isValid ? "pointer" : "not-allowed"
                }}
            >
                Confirmar
            </button>
        </div>
    );
}