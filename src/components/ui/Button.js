import React from "react";

const VARIANTS = {
  // Padrão: mesma receita do "Início", em azul-escuro para fundos claros
  // (transparente, borda fina translúcida, texto semibold, tom no hover)
  primary:
    "bg-transparent text-brand font-semibold border border-brand/60 hover:bg-brand/10",
  // Variação clara com borda azul-clara
  secondary:
    "bg-white text-brand font-semibold border border-brand-border hover:bg-brand-soft",
  // Preenchido liso (sem gradiente): estado "selecionado" de alternadores
  solid:
    "bg-brand text-white font-semibold border border-brand hover:bg-brand/90",
  // Para fundo escuro (ex.: "Início" no header)
  onDark:
    "bg-transparent text-white font-semibold border border-white/60 hover:bg-white/10",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export default function Button({
  variant = "solid",
  size = "md",
  className = "",
  type = "button",
  children,
  ...rest
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg transition disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}