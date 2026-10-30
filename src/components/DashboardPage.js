import React, { useEffect, useState } from "react";
import { useCSVReader } from "react-papaparse";
import axios from "axios";

import Header from "./ui/Header";
import Tabs from "./ui/Tabs";
import PageTitleBar from "./ui/PageTitleBar";
import Card from "./ui/Card";
import Button from "./ui/Button";
import TabNav from "./ui/TabNav";

import Inicio from "./home/Inicio";
import ColumnMapper from "./home/ColumnMapper";
import Filters from "./tabMain/filters/Filters";
import Analise from "./tabPotential/Analise";
import SerieSpeed from "./tabMain/SerieSpeed";
import SerieSuavizada from "./tabMain/SerieSuavizada";
import SerieDirection from "./tabMain/SerieDirection";
import StickPlot from "./tabMain/StickPlot";
import ProfileChart from "./tabMain/ProfileChart";
import GranularityChart from "./tabMain/GranularityChart";
import WindRoseChart from "./tabMain/WindRoseChart";
import HeatMapChart from "./tabMain/HeatMapChart";
import HistogramChart from "./tabMain/HistogramChart";
import SpiralChart from "./tabMain/SpiralChart";
import DFAChart from "./tabStatistics/DFAChart";

const TABS = [
  { key: "principal", label: "Principal" },
  { key: "potencial", label: "Potencial Energético" },
  { key: "estatisticas", label: "Estatísticas" },
];

// ───────── Painel Tabs ─────────
function TabPanel({ tabKey, active, children }) {
  return (
    <section
      id={`panel-${tabKey}`}
      role="tabpanel"
      aria-labelledby={`tab-${tabKey}`}
      hidden={active !== tabKey}
    >
      {children}
    </section>
  );
}

export default function DashboardPage() {
  const { CSVReader } = useCSVReader();

  // ───────── Estados ─────────
  const [csvData, setCsvData] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [speedRange, setSpeedRange] = useState([0, 20]); // Intervalo inicial de velocidade ajustado
  const [respostaApiSS, setRespostaApiSS] = useState(null); // Estado para armazenar a resposta da API
  const [respostaApiDFA, setRespostaApiDFA] = useState(null);
  const [rawRows, setRawRows] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [columnMap, setColumnMap] = useState(null);
  const [readerKey, setReaderKey] = useState(0);
  const [, setHasHeader] = useState(true);
  const [stationCoordinates, setStationCoordinates] = useState(null);
  const [mapperKey, setMapperKey] = useState(0); // remonta o ColumnMapper a cada upload
  const [activeTab, setActiveTab] = useState("principal");
  const hasData = csvData !== null; // dashboard aparece quando os dados já foram normalizados

  // ───────── Processamento Série Suavizada ─────────
  const enviarParaApiSS = async (dados) => {
    try {
      // const response = await axios.post('http://localhost:5000/processar', dados);
      const response = await axios.post('https://wind-insights.onrender.com/processarSS', dados);
      setRespostaApiSS(response.data);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    }
  };

  // ───────── Processamento DFA ─────────
  const enviarParaApiDFA = async (dados) => {
    try {
      const response = await axios.post('https://wind-insights.onrender.com/processarDFA', dados);
      setRespostaApiDFA(response.data);
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
      return true; // Inclui a linha se passar em todos os filtros
    }) : csvData;

  const filteredSuavizada = respostaApiSS && (startDate || endDate || speedRange)
    ? respostaApiSS.filter(row => {
      const dateStr = row[0];
      const value = parseFloat(row[1]);
      const rowDate = new Date(dateStr);

      // Ajuste para comparar só a data (ignorando hora)
      let start = startDate ? new Date(startDate) : null;
      let end = endDate ? new Date(endDate) : null;
      if (start) {
        start.setHours(0, 0, 0, 0);
      }
      if (end) {
        end.setHours(23, 59, 59, 999);
      }
      if (start && rowDate < start) return false;
      if (end && rowDate > end) return false;
      if (isNaN(value) || value < speedRange[0] || value > speedRange[1]) return false;
      return true;
    })
    : respostaApiSS;

  const extrairPartesTimestamp = (timestamp) => {
    if (!timestamp) return {};

    const date = new Date(timestamp);

    if (isNaN(date)) return {};

    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      hour: date.getHours(),
      minute: date.getMinutes(),
    };
  };

  const normalizarDados = (rows, map) => {
    return rows.map(row => {

      const ws = parseFloat(row[map.ws100]);
      const wd = parseFloat(row[map.wdir100]);

      if (isNaN(ws) || isNaN(wd)) return null;

      let timestamp = map.timestamp !== undefined
        ? row[map.timestamp]
        : null;

      let year = map.year !== undefined ? row[map.year] : null;
      let month = map.month !== undefined ? row[map.month] : null;
      let day = map.day !== undefined ? row[map.day] : null;
      let hour = map.hour !== undefined ? row[map.hour] : null;
      let minute = map.minute !== undefined ? row[map.minute] : null;

      if (timestamp && (!year || !month || !day)) {
        const partes = extrairPartesTimestamp(timestamp);
        year = partes.year;
        month = partes.month;
        day = partes.day;
        hour = partes.hour;
        minute = partes.minute;
      }

      if (!timestamp && year) {
        timestamp = `${year}-${month}-${day} ${hour ?? 0}:${minute ?? 0}`;
      }

      return {
        id: timestamp,
        year: Number(year),
        month: Number(month),
        day: Number(day),
        hour: Number(hour),
        minute: Number(minute),
        ws100: ws,
        wdir100: wd,
      };

    }).filter(Boolean);
  };

  useEffect(() => {
    if (rawRows && columnMap) {
      const dados = normalizarDados(rawRows, columnMap);
      setCsvData(dados);

      Promise.all([
        enviarParaApiSS(dados),
        enviarParaApiDFA(dados)
      ]);
    }
  }, [rawRows, columnMap]);

  // ───────── Upload / Parsing ─────────
  const detectDelimiter = (sampleLine) => {
    const countSemicolon = (sampleLine.match(/;/g) || []).length;
    const countComma = (sampleLine.match(/,/g) || []).length;
    return countSemicolon > countComma ? ";" : ",";
  };

  const splitLine = (line, delimiter) => {
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const cleanField = (field) => {
    return String(field)
      .replace(/\\"/g, "")
      .replace(/^"|"$/g, "")
      .trim();
  };

  const processRawText = (rawText) => {
    // Remove BOM se presente
    const text = rawText.replace(/^\uFEFF/, "");

    // Pega as primeiras linhas não-vazias para detectar delimitador
    const nonEmptyLines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (nonEmptyLines.length === 0) return { headers: [], rows: [] };

    const delimiter = detectDelimiter(nonEmptyLines[0]);

    const allRows = nonEmptyLines.map(line => splitLine(line, delimiter).map(cleanField));

    const firstRow = allRows[0];
    const pareceHeader = firstRow.some(v => isNaN(parseFloat(v)) && v.trim() !== "");

    let headerRow, dataRows;
    if (pareceHeader) {
      headerRow = firstRow;
      dataRows = allRows.slice(1);
    } else {
      headerRow = firstRow.map((_, i) => `Coluna ${i + 1}`);
      dataRows = allRows;
    }

    return { headers: headerRow, rows: dataRows, hasHeaderDetected: pareceHeader };
  };

  const handleUploadAccepted = (results) => {
    setColumnMap(null);
    setCsvData(null);
    setRespostaApiSS(null);
    setRespostaApiDFA(null);
    setStationCoordinates(null);
    setMapperKey(prev => prev + 1);

    const rawLines = results.data
      .filter(r => r.length > 0)
      .map(r => {
        // Se veio como array de múltiplos campos (fallback do papaparse)
        if (r.length > 1) return r.join(",");
        return String(r[0] || "");
      });

    const rawText = rawLines.join("\n");
    const { headers: detectedHeaders, rows, hasHeaderDetected } = processRawText(rawText);

    setHasHeader(hasHeaderDetected);
    setHeaders({ columns: detectedHeaders, hasHeaderDetected, rawRows: rows, rawText });
    setRawRows(rows);
  };

  const handleHeaderToggle = (userSaysHasHeader) => {
    // re-processa as linhas quando o usuário altera o checkbox de cabeçalho
    const rawText = headers.rawText;
    const nonEmptyLines = rawText.split(/\n/).filter(l => l.trim().length > 0);
    const delimiter = nonEmptyLines.length > 0
      ? (nonEmptyLines[0].match(/;/g) || []).length > (nonEmptyLines[0].match(/,/g) || []).length ? ";" : ","
      : ",";

    const cleanField = (field) =>
      String(field).replace(/\\"/g, "").replace(/^"|"$/g, "").trim();

    const splitLine = (line, delim) => {
      const result = [];
      let current = "";
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQuotes = !inQuotes; }
        else if (ch === delim && !inQuotes) { result.push(current.trim()); current = ""; }
        else { current += ch; }
      }
      result.push(current.trim());
      return result;
    };

    const allRows = nonEmptyLines.map(line => splitLine(line, delimiter).map(cleanField));

    if (userSaysHasHeader) {
      setHeaders(prev => ({ ...prev, columns: allRows[0], hasHeaderDetected: true }));
      setRawRows(allRows.slice(1));
    } else {
      setHeaders(prev => ({
        ...prev,
        columns: allRows[0].map((_, i) => `Coluna ${i + 1}`),
        hasHeaderDetected: false
      }));
      setRawRows(allRows);
    }
  };

  const handleConfirm = (mapping, coordinates) => {
    setColumnMap(mapping);
    setStationCoordinates(coordinates);
  };

  const handleAbrirMapa3D = () => {
    if (!stationCoordinates) return;

    try {
      const payload = {
        data: displayedData,
        coordinates: stationCoordinates
      };
      localStorage.setItem("windRose3DData", JSON.stringify(payload));
      window.open("/wind-rose-map", "_blank");
    } catch (error) {
      console.error("Erro ao preparar dados para o mapa 3D:", error);
    }
  };

  const resetToHome = () => {
    setCsvData(null);
    setHeaders(null);
    setRawRows(null);
    setColumnMap(null);
    setStationCoordinates(null);
    setRespostaApiSS(null);
    setRespostaApiDFA(null);
    setStartDate(null);
    setEndDate(null);
    setSpeedRange([0, 20]);
    setReaderKey(prev => prev + 1);
    setActiveTab("principal");
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
    window.scrollTo({ top: 0 });
  };

  // Highcharts e Plotly recalculam tamanho dos gráficos ao trocar de tab.
  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [activeTab]);

  const activeLabel = TABS.find((t) => t.key === activeTab)?.label;

  const filtroAtivo =
    startDate || endDate || speedRange[0] !== 0 || speedRange[1] !== 20;

  return (
    <div className="min-h-screen">
      <Header showHome={hasData} onHome={resetToHome} />

      {/* ───────── HOME (sem dados) ───────── */}
      {!hasData && (
        <main className="mx-auto grid w-full max-w-screen-2xl grid-cols-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-2">
          <Inicio>
            <CSVReader
              key={readerKey}
              config={{
                header: false,
                skipEmptyLines: true,
                delimiter: "",
                quoteChar: null,
                escapeChar: "\\",
              }}
              onUploadAccepted={handleUploadAccepted}
            >
              {({ getRootProps, ProgressBar }) => (
                <>
                  <Button size="lg" {...getRootProps()}>
                    Carregar dados
                  </Button>

                  <div className="w-full">
                    <ProgressBar />
                  </div>

                  <span className="text-center text-sm italic text-brand">
                    * O tempo de execução do sistema varia de acordo com a quantidade de dados, aguarde um momento após selecionar o arquivo e alterar os filtros
                  </span>
                </>
              )}
            </CSVReader>
          </Inicio>

          <ColumnMapper
            key={mapperKey}
            headers={headers ? headers.columns : []}
            hasHeaderDetected={headers?.hasHeaderDetected}
            rawRows={rawRows}
            disabled={!headers}
            onHeaderToggle={handleHeaderToggle}
            onConfirm={handleConfirm}
          />
        </main>
      )}

      {/* ───────── DASHBOARD (dados carregados) ───────── */}
      {hasData && (
        <>
          <Tabs tabs={TABS} active={activeTab} onChange={handleTabChange} />

          <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 sm:px-6">
            <div className="mb-4">
              <PageTitleBar title={activeLabel}>
                {activeTab === "principal" && (
                  <Filters
                    startDate={startDate}
                    endDate={endDate}
                    setStartDate={setStartDate}
                    setEndDate={setEndDate}
                    speedRange={speedRange}
                    setSpeedRange={setSpeedRange}
                  />
                )}
              </PageTitleBar>

              {activeTab === "principal" && (
                <p className="mt-3 text-sm italic text-brand">
                  * O tempo de execução do sistema varia de acordo com a quantidade de dados, aguarde um momento após selecionar o arquivo e alterar os filtros
                </p>
              )}
            </div>

            {/* ── Principal ── */}
            <TabPanel tabKey="principal" active={activeTab}>
              {displayedData && displayedData.length > 0 ? (
                <div className="flex flex-col gap-4">
                  <SerieSpeed data={displayedData} />

                  <SerieSuavizada data={filteredSuavizada} />

                  <SerieDirection data={displayedData} />

                  <div id="stick-plot">
                    <StickPlot data={displayedData} />
                  </div>

                  <ProfileChart data={displayedData} />

                  <GranularityChart data={displayedData} />

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                      <HeatMapChart data={displayedData} />
                    </Card>
                    <Card>
                      <HistogramChart data={displayedData} />
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                      <WindRoseChart
                        data={displayedData}
                        onOpenMap={handleAbrirMapa3D}
                        mapDisabled={!stationCoordinates}
                      />
                    </Card>
                    <Card>
                      <SpiralChart data={displayedData} />
                    </Card>
                  </div>
                </div>
              ) : (
                <Card>
                  <p className="py-6 text-center text-slate-600">
                    {filtroAtivo
                      ? "Nenhum dado encontrado para este filtro."
                      : "Arquivo CSV carregado, mas não há dados válidos para exibir."}
                  </p>
                </Card>
              )}
            </TabPanel>

            {/* ── Potencial Energético ── */}
            <TabPanel tabKey="potencial" active={activeTab}>
              <Analise data={csvData} />
            </TabPanel>

            {/* ── Estatísticas ── */}
            <TabPanel tabKey="estatisticas" active={activeTab}>
              <Card>
                <DFAChart data={respostaApiDFA} totalRegistros={csvData?.length} />
              </Card>
            </TabPanel>

            <TabNav tabs={TABS} active={activeTab} onChange={handleTabChange} />
          </main>
        </>
      )}
    </div>
  );
}