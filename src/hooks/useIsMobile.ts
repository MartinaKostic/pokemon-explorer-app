import { useEffect, useState } from "react";

export function useIsMobile() {
  const [isMobile, set] = useState(
    () => window.matchMedia("(max-width: 767px)").matches
  );
  useEffect(() => {
    const m = window.matchMedia("(max-width: 767px)");
    const on = () => set(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return isMobile;
}
