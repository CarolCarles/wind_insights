import React from "react";
import Button from "./Button";

function ArrowLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z" />
    </svg>
  );
}

// Navegação ao final de cada aba: atalho para a aba anterior (esquerda) e
// para a próxima (direita), rotulados com o nome do destino. É complementar
// às abas do topo, que continuam sempre acessíveis.
// - tabs: [{ key, label }] na mesma ordem das abas
// - active: key da aba ativa
// - onChange: recebe a key da aba de destino
export default function TabNav({ tabs, active, onChange }) {
  const index = tabs.findIndex((t) => t.key === active);
  if (index === -1) return null;

  const prev = index > 0 ? tabs[index - 1] : null;
  const next = index < tabs.length - 1 ? tabs[index + 1] : null;

  return (
    <nav
      aria-label="Navegação entre abas"
      className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4"
    >
      {prev ? (
        <Button
          aria-label={`Ir para a aba ${prev.label}`}
          onClick={() => onChange(prev.key)}
        >
          <ArrowLeft />
          {prev.label}
        </Button>
      ) : (
        <span />
      )}

      {next ? (
        <Button
          aria-label={`Ir para a aba ${next.label}`}
          onClick={() => onChange(next.key)}
        >
          {next.label}
          <ArrowRight />
        </Button>
      ) : (
        <span />
      )}
    </nav>
  );
}