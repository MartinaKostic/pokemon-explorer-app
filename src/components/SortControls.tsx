import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import type { SortOption } from "../types/pokemon";

type Props = {
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
};

const SORT_OPTIONS = [
  { field: "none" as const, label: "Default Order" },
  { field: "name" as const, label: "Name" },
  { field: "totalPower" as const, label: "Total Power" },
  { field: "generation" as const, label: "Generation" },
  { field: "attack" as const, label: "Attack" },
  { field: "defense" as const, label: "Defense" },
  { field: "speed" as const, label: "Speed" },
];

export function SortControls({ sortOption, onSortChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const currentOption = SORT_OPTIONS.find(
    (opt) => opt.field === sortOption.field
  );

  const dirLabel = (field: SortOption["field"], dir: "asc" | "desc") => {
    const isName = field === "name";
    const asc = isName ? "A→Z" : "Min→Max";
    const desc = isName ? "Z→A" : "Max→Min";
    return dir === "asc" ? asc : desc;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="btn">
        <span className="text-sm font-medium">
          {sortOption.field === "none"
            ? "Sort: Default Order"
            : `Sort: ${currentOption?.label} (${dirLabel(sortOption.field, sortOption.direction)})`}
        </span>
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-slate-300 rounded-lg shadow-lg z-50 min-w-[200px]">
          {SORT_OPTIONS.map((option) => (
            <div
              key={option.field}
              className="border-b border-slate-100 last:border-b-0"
            >
              {option.field === "none" ? (
                <button
                  onClick={() => {
                    onSortChange({ field: option.field, direction: "asc" });
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-slate-50 text-sm ${
                    sortOption.field === "none"
                      ? "bg-blue-50 text-blue-600"
                      : ""
                  }`}
                >
                  {option.label}
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onSortChange({ field: option.field, direction: "asc" });
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 text-sm ${
                      sortOption.field === option.field &&
                      sortOption.direction === "asc"
                        ? "bg-blue-50 text-blue-600"
                        : ""
                    }`}
                  >
                    {option.label} ({dirLabel(option.field, "asc")})
                  </button>
                  <button
                    onClick={() => {
                      onSortChange({ field: option.field, direction: "desc" });
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-slate-50 text-sm ${
                      sortOption.field === option.field &&
                      sortOption.direction === "desc"
                        ? "bg-blue-50 text-blue-600"
                        : ""
                    }`}
                  >
                    {option.label} ({dirLabel(option.field, "desc")})
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
