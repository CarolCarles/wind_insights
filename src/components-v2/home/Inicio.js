import React from "react";
import Card from "../ui/Card";

// Conteúdo "Como usar" + formato recomendado (textos idênticos ao original).
// O selo grande "Wind Insights" foi removido: o título agora vive no Header.
// `children` é o espaço onde a home encaixa o botão "Carregar dados".
export default function Inicio({ children }) {
  return (
    <Card title="Análise de Dados de Vento" bodyClassName="p-5">
      <div className="text-left">
        <b className="text-brand">Como usar:</b>
        <ol className="mt-2 list-inside list-decimal space-y-1.5 leading-relaxed text-slate-700">
          <li>Faça upload do seu arquivo CSV.</li>
          <li>Confirme se o arquivo tem cabeçalho.</li>
          <li>Preencha os dados de vento e tempo.</li>
          <li>Use os filtros para explorar os dados.</li>
          <li>Veja os gráficos gerados automaticamente.</li>
        </ol>

        <div className="mt-5 text-[15px] font-semibold text-brand">
          Formato recomendado:
        </div>
        <div className="mt-2 inline-block max-w-full overflow-x-auto rounded-lg border border-line bg-brand-soft p-3 font-mono text-sm text-slate-800">
          timestamp,velocidade,direcao
          <br />
          2021-09-16 18:00:00,8.51,53.95
        </div>
      </div>

      {children && (
        <div className="mt-6 flex flex-col items-center gap-3">{children}</div>
      )}
    </Card>
  );
}