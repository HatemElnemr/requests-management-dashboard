import { X } from "lucide-react";
import type { FilterChip } from "@/features/requests/types/requests";

interface ActiveFiltersProps {
  filters: FilterChip[];
  onRemove: (id: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({ filters, onRemove, onClearAll }: ActiveFiltersProps) {
  if (filters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      <span className="text-xs text-gray-400">Active filters:</span>
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onRemove(f.id)}
          aria-label={`Remove filter ${f.label}`}
          className="group inline-flex items-center gap-1.5 h-6 px-2.5 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-full hover:bg-gray-200 transition-colors"
        >
          {f.label}
          <X className="w-2.5 h-2.5 text-gray-400 group-hover:text-gray-700 transition-colors" />
        </button>
      ))}
      <button
        type="button"
        onClick={onClearAll}
        className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2"
      >
        Clear all
      </button>
    </div>
  );
}
