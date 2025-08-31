interface PokemonLogoProps {
  onClick: () => void;
}

export function PokemonLogo({ onClick }: PokemonLogoProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:opacity-80"
    >
      <img src="/pokemon-logo.png" alt="Pokemon" className="h-10 w-auto" />
      <span
        className="text-lg font-bold text-blue-600 tracking-widest uppercase text-center"
        style={{
          fontFamily: '"SF Pro Display", "Segoe UI", system-ui, sans-serif',
          letterSpacing: "0.2em",
        }}
      >
        Explorer
      </span>
    </button>
  );
}
