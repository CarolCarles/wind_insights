import React, { useMemo, useState } from "react";

import Card from "../ui/Card";
import Button from "../ui/Button";
import AnaliseGoodSpeed from "./AnaliseGoodSpeed";
import CasasAbastecidas from "./CasasAbastecidas";
import ArvoresSalvas from "./ArvoresSalvas";
import AguaEconomizada from "./AguaEconomizada";

const FIELD_LABEL = "flex items-center gap-2 text-[15px] font-medium text-brand";
const FIELD_INPUT =
  "h-[30px] w-20 rounded-md border-[1.5px] border-brand-border bg-white px-2 text-[15px] text-brand shadow-sm outline-none transition focus:border-brand";

function Analise({ data }) {
  // Dados vêm por prop. Se vierem vazios, tenta o localStorage como
  // fallback (comportamento do original, que abria em outra aba).
  // useMemo evita re-parsear o JSON a cada tecla digitada nos inputs.
  const csvData = useMemo(() => {
    if (Array.isArray(data) && data.length > 0) return data;
    try {
      return JSON.parse(localStorage.getItem("csvData")) || [];
    } catch {
      return [];
    }
  }, [data]);

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

  // Dados usados nos cálculos (mesmos textos e valores do rodapé original)
  const dadosDoCalculo = [
    { label: "Raio da turbina", value: `${raioTurbina} m` },
    { label: "Eficiência", value: `${eficiencia}` },
    { label: "Velocidade mínima considerada", value: `${limiteVelocidade} m/s` },
    { label: "Densidade do ar", value: "1.225 kg/m³" },
    {
      label: "Área varrida pelas pás",
      value: `${(Math.PI * Math.pow(raioTurbina, 2)).toFixed(2)} m²`,
    },
    { label: "Consumo médio mensal por casa", value: "300 kWh" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Card title="Parâmetros do sistema">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className={FIELD_LABEL}>
            Raio da turbina (m):
            <input
              type="number"
              value={raioTurbinaInput}
              min={1}
              onChange={(e) => setRaioTurbinaInput(e.target.value)}
              className={FIELD_INPUT}
            />
          </label>

          <label className={FIELD_LABEL}>
            Eficiência da turbina:
            <input
              type="number"
              step="0.01"
              value={eficienciaInput}
              min={0}
              max={1}
              onChange={(e) => setEficienciaInput(e.target.value)}
              className={FIELD_INPUT}
            />
          </label>

          <label className={FIELD_LABEL}>
            Velocidade mínima (m/s):
            <input
              type="number"
              step="0.01"
              value={limiteVelocidadeInput}
              min={0}
              onChange={(e) => setLimiteVelocidadeInput(e.target.value)}
              className={FIELD_INPUT}
            />
          </label>

          <Button onClick={atualizarParametros}>Atualizar</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <AnaliseGoodSpeed data={csvData} limiteVelocidade={limiteVelocidade} />
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <CasasAbastecidas data={csvData} raioTurbina={raioTurbina} eficiencia={eficiencia} />
          <ArvoresSalvas data={csvData} raioTurbina={raioTurbina} eficiencia={eficiencia} />
          <AguaEconomizada data={csvData} raioTurbina={raioTurbina} eficiencia={eficiencia} />

          {/* Dados utilizados nos cálculos: logo abaixo dos indicadores */}
          <Card title="Dados utilizado para realizar os cálculos:">
            <dl className="text-[15px]">
              {dadosDoCalculo.map((item) => (
                <div
                  key={item.label}
                  className="flex items-baseline justify-between gap-3 border-b border-line py-2 first:pt-0 last:border-b-0 last:pb-0"
                >
                  <dt className="text-slate-700">{item.label}:</dt>
                  <dd className="text-right font-bold text-brand">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default Analise;