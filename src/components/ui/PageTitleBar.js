import React from "react";

// Barra de título da página: nome da tab ativa à esquerda e, opcionalmente,
// os filtros à direita (children). Quebra linha no mobile.
export default function PageTitleBar({ title, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h2 className="text-xl font-bold text-slate-700">{title}</h2>
      {children && (
        <div className="flex flex-wrap items-center gap-3">{children}</div>
      )}
    </div>
  );
}