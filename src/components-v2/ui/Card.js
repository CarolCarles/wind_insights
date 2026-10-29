import React from "react";

// Contêiner padrão dos gráficos: fundo branco, borda sutil e sombra leve.
// - title: título no topo à esquerda (omitir quando o título já está dentro do gráfico)
// - icon / iconLabel: ícone SVG opcional antes do título (usado pelo StatCard)
// - action: elemento(s) à direita do cabeçalho (ex.: botões do ProfileChart)
// - bodyClassName: permite trocar o padding do corpo (ex.: "p-0")
// "min-w-0" evita que gráficos estourem a largura dentro de grid/flex.
export default function Card({
  title,
  icon,
  iconLabel,
  action,
  className = "",
  bodyClassName = "p-4",
  children,
}) {
  const hasHeader = Boolean(title || icon || action);

  return (
    <section
      className={`min-w-0 rounded-lg border border-line bg-white shadow-sm ${className}`}
    >
      {hasHeader && (
        <header className="flex items-center justify-between gap-3 px-4 pt-3">
          <div className="flex items-center gap-2.5">
            {icon && (
              <span
                role="img"
                aria-label={iconLabel}
                className="shrink-0 [&>svg]:h-6 [&>svg]:w-6"
              >
                {icon}
              </span>
            )}
            {title && (
              <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
            )}
          </div>
          {action && <div className="flex items-center gap-2">{action}</div>}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}