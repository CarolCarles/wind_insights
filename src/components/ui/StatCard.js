import React from "react";
import Card from "./Card";

// Card de indicador (ícone + título + texto), usado em Casas Abastecidas,
// Árvores Salvas e Água Economizada. Os cálculos continuam em cada componente.
// Agora é um invólucro do Card, então padding, título e borda são idênticos
// aos dos cards de gráfico.
// - icon: elemento SVG (exibido com 24px)
// - iconLabel: texto de acessibilidade do ícone (mantém o aria-label original)
export default function StatCard({
  icon,
  iconLabel,
  title,
  className = "",
  children,
}) {
  return (
    <Card title={title} icon={icon} iconLabel={iconLabel} className={className}>
      <div className="space-y-2 text-[15px] leading-relaxed text-slate-800">
        {children}
      </div>
    </Card>
  );
}