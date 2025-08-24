import { useIsMobile } from "../hooks/useIsMobile";
import { PokemonGridMobile } from "./PokemonGrid.mobile";
import { PokemonGridDesktop } from "./PokemonGrid.desktop";

export function PokemonGrid() {
  const isMobile = useIsMobile();
  return isMobile ? <PokemonGridMobile /> : <PokemonGridDesktop />;
}
