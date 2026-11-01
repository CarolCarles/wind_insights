import React from "react";
import Card from "../ui/Card";
import Button from "../ui/Button";
import DisabledOverlay from "../ui/DisabledOverlay";

const SECTION_LABEL =
  "mb-1.5 text-left text-sm font-bold uppercase tracking-wide text-brand";
const GROUP_BASE =
  "flex flex-col gap-2 rounded-lg border-[1.5px] px-3.5 py-2.5 transition-colors";
const GROUP_FILLED = "border-[#a5d6a7] bg-[#e8f5e9]";
const GROUP_EMPTY = "border-brand-border bg-brand-soft";
const COORD_INPUT =
  "min-w-[150px] flex-1 rounded-lg border-[1.5px] border-brand-border bg-brand-soft px-2 py-1 text-sm text-brand shadow-sm outline-none focus:border-brand";

export default function ColumnMapper({
  headers = [],
  hasHeaderDetected,
  rawRows,
  onHeaderToggle,
  onConfirm,
  disabled = false,
}) {
  const [mapping, setMapping] = React.useState({});
  const [userHasHeader, setUserHasHeader] = React.useState(hasHeaderDetected ?? true);
  const [latInput, setLatInput] = React.useState("");
  const [lonInput, setLonInput] = React.useState("");

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

  // Coordenada é opcional — não entra na validação do botão Confirmar,
  // só é repassada pro componente pai se estiver preenchida corretamente.
  const stationCoordinates = (() => {
    const lat = parseFloat(String(latInput).replace(",", "."));
    const lon = parseFloat(String(lonInput).replace(",", "."));
    if (isNaN(lat) || isNaN(lon)) return null;
    return [lat, lon];
  })();

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
        className={`flex flex-col gap-1 transition-opacity sm:flex-row sm:items-center ${
          isDisabled ? "opacity-40" : "opacity-100"
        }`}
        title={isDisabled ? campo.disabledReason : ""}
      >
        <label
          htmlFor={`campo-${campo.key}`}
          className="text-left text-[15px] font-semibold text-brand sm:w-56 sm:shrink-0"
        >
          {campo.label}
        </label>
        <select
          id={`campo-${campo.key}`}
          value={mapping[campo.key] ?? ""}
          disabled={isDisabled}
          onChange={(e) => handleChangeWithMutualExclusion(campo.key, e.target.value)}
          className={`min-w-40 rounded-lg border-[1.5px] border-brand-border px-2 py-1 text-sm shadow-sm ${
            isDisabled ? "cursor-not-allowed bg-[#f0f0f0]" : "cursor-pointer bg-brand-soft"
          }`}
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
    <DisabledOverlay
      disabled={disabled}
      title="Carregue um arquivo para habilitar o mapeamento"
    >
      <Card title="Mapeamento de Dados" bodyClassName="p-5">
        {/* ── Checkbox ── */}
        <div className="mb-5 flex items-center gap-3 rounded-lg border-[1.5px] border-brand-border bg-brand-soft px-3.5 py-2.5">
          <input
            type="checkbox"
            id="hasHeader"
            checked={userHasHeader}
            onChange={(e) => handleHeaderToggle(e.target.checked)}
            className="h-[18px] w-[18px] cursor-pointer accent-brand"
          />
          <label
            htmlFor="hasHeader"
            className="cursor-pointer select-none text-[15px] font-semibold text-brand"
          >
            {userHasHeader ? "Arquivo tem cabeçalho" : "Arquivo não tem cabeçalho"}
          </label>
        </div>

        {/* ── Campos de vento ── */}
        <div>
          <div className={SECTION_LABEL}>Dados de Vento — preencha os campos abaixo:</div>
          <div className={`${GROUP_BASE} ${windMapped ? GROUP_FILLED : GROUP_EMPTY}`}>
            {windFields.map(renderSelect)}
          </div>
        </div>

        {/* ── Divisor ── */}
        <div className="my-2.5 border-t-[1.5px] border-dashed border-brand-border" />

        {/* ── Tempo ── */}
        <div>
          <div className={SECTION_LABEL}>Tempo — escolha e preencha uma das opções abaixo:</div>

          {/* Opção A: Timestamp */}
          <div className={`${GROUP_BASE} ${timestampMapped ? GROUP_FILLED : GROUP_EMPTY}`}>
            {renderSelect(timeField)}
          </div>

          {/* Divisor "OU" */}
          <div className="my-2.5 flex items-center gap-2">
            <div className="h-px flex-1 bg-brand-border" />
            <span className="text-sm font-bold text-[#7986cb]">OU</span>
            <div className="h-px flex-1 bg-brand-border" />
          </div>

          {/* Opção B: Campos separados */}
          <div className={`${GROUP_BASE} ${separateTimeMapped ? GROUP_FILLED : GROUP_EMPTY}`}>
            {separateFields.map(renderSelect)}
          </div>
        </div>

        {/* ── Divisor ── */}
        <div className="my-2.5 border-t-[1.5px] border-dashed border-brand-border" />

        {/* ── Coordenada do posto eólico (opcional) ── */}
        <div>
          <div className={SECTION_LABEL}>
            Localização — opcional, habilita a visualização 3D no mapa:
          </div>
          <div className={`${GROUP_BASE} ${stationCoordinates ? GROUP_FILLED : GROUP_EMPTY}`}>
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="station-lat"
                className="text-left text-[15px] font-semibold text-brand sm:w-56 sm:shrink-0"
              >
                Coordenada do posto eólico
              </label>

              <input
                id="station-lat"
                type="text"
                inputMode="decimal"
                placeholder="Latitude"
                value={latInput}
                onChange={(e) => setLatInput(e.target.value)}
                className={COORD_INPUT}
              />

              <input
                id="station-lon"
                type="text"
                inputMode="decimal"
                placeholder="Longitude"
                value={lonInput}
                onChange={(e) => setLonInput(e.target.value)}
                className={COORD_INPUT}
                aria-label="Longitude"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-center">
          <Button
            size="lg"
            className="w-full sm:w-64"
            onClick={() => onConfirm(mapping, stationCoordinates)}
            disabled={!isValid}
          >
            Confirmar
          </Button>
        </div>
      </Card>
    </DisabledOverlay>
  );
}