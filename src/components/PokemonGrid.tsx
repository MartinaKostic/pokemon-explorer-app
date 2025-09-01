import { useIsMobile } from "../hooks/useIsMobile";
import { PokemonGridMobile } from "./PokemonGrid.mobile";
import { PokemonGridDesktop } from "./PokemonGrid.desktop";

type Props = {
  onPokemonSelect?: (id: number) => void;
};

export function PokemonGrid({ onPokemonSelect }: Props) {
  const isMobile = useIsMobile();
  return isMobile ? (
    <PokemonGridMobile onPokemonSelect={onPokemonSelect} />
  ) : (
    <PokemonGridDesktop onPokemonSelect={onPokemonSelect} />
  );
}
