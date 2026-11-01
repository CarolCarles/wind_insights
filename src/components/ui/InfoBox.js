import React from "react";

// Caixa de "Dica" (substitui a versão duplicada em 6 componentes).
// Alinhada à direita, ocupando só a largura necessária.
// Uso: <InfoBox><b>Dica:</b> texto...<br />outra linha</InfoBox>
export default function InfoBox({ children, className = "" }) {
  return (
    <div
      className={`mt-3 ml-auto w-fit max-w-full rounded-lg border border-brand-border bg-brand-soft px-4 py-2.5 text-right text-sm text-brand ${className}`}
    >
      {children}
    </div>
  );
}