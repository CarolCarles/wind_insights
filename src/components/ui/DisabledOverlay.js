import React from "react";

// "Película invisível" que desabilita visual e funcionalmente o conteúdo.
// - Com disabled = true: o conteúdo fica esmaecido, sem foco por teclado
//   (atributo "inert", suportado pelo React 19) e uma camada transparente
//   bloqueia cliques.
// - Com disabled = false: renderiza o conteúdo normalmente.
export default function DisabledOverlay({
  disabled = false,
  title,
  className = "",
  children,
}) {
  return (
    <div className={`relative ${className}`}>
      <div
        inert={disabled}
        aria-disabled={disabled || undefined}
        className={`transition-opacity ${
          disabled ? "select-none opacity-50" : "opacity-100"
        }`}
      >
        {children}
      </div>

      {disabled && (
        <div
          className="absolute inset-0 z-10 cursor-not-allowed"
          title={title}
          aria-hidden="true"
        />
      )}
    </div>
  );
}