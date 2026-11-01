import React from "react";

// Barra de tabs no estilo da referência.
// - tabs: [{ key, label, icon? }]  (icon é um elemento SVG opcional)
// - active: key da tab ativa
// - onChange: recebe a key da tab clicada
// Cada botão tem id "tab-<key>" e aponta para o painel "panel-<key>"
// (o DashboardPage deve usar esses mesmos ids nos painéis).
export default function Tabs({ tabs, active, onChange }) {
  return (
    <nav
      role="tablist"
      aria-label="Seções da análise"
      className="flex overflow-x-auto border-b border-line bg-white px-2 sm:px-4"
    >
      {tabs.map((tab) => {
        const isActive = tab.key === active;

        return (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            type="button"
            aria-selected={isActive}
            aria-controls={`panel-${tab.key}`}
            onClick={() => onChange(tab.key)}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm transition ${
              isActive
                ? "border-brand font-semibold text-brand"
                : "border-transparent font-medium text-slate-500 hover:bg-page hover:text-brand"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}