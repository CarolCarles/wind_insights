import React from "react";
import Button from "./Button";

// Faixa estreita azul-escura no topo.
// - showHome: controla a exibição do botão "Início" (oculto na home)
// - onHome: ação do botão (no DashboardPage, executa o reset completo)
export default function Header({ showHome = false, onHome }) {
  return (
    <header className="flex h-12 items-center justify-between bg-brand px-4 sm:px-6">
      <h1 className="font-display text-lg font-bold tracking-wide text-white sm:text-2xl">
        Wind Insights
      </h1>

      {showHome && (
        <Button variant="onDark" size="sm" onClick={onHome}>
          Início
        </Button>
      )}
    </header>
  );
}