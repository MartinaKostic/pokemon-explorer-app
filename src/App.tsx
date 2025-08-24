import { PokemonGrid } from "./components/PokemonGrid";

function App() {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-3 font-semibold">
          Pokémon Explorer
        </div>
      </header>
      <main className="container mx-auto px-4 py-6">
        Setup
        <PokemonGrid></PokemonGrid>
      </main>
    </div>
  );
}

export default App;
