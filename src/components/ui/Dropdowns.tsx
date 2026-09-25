import { useId, useState } from "react";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import type { SelectOption } from "@/features/requests/types/requests";

interface FilterDropdownProps {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange: (value: string) => void;
  /** النص المعروض عند عدم اختيار أي قيمة، مثل "All Statuses" */
  allLabel?: string;
}

export function FilterDropdown({
  label,
  options,
  value = "",
  onChange,
  allLabel,
}: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  function choose(next: string) {
    onChange(next);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all whitespace-nowrap"
      >
        {selected ? (
          <>
            <span className="text-gray-400">{label}:</span> {selected.label}
          </>
        ) : (
          allLabel ?? label
        )}
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </button>

      {isOpen && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 left-0 w-44 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === ""}
            onClick={() => choose("")}
            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50"
          >
            {allLabel ?? `All ${label}`}
            {value === "" && <Check className="w-3 h-3 text-gray-900" />}
          </button>
          <div className="border-t border-gray-100 my-0.5" />
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => choose(opt.value)}
              className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {opt.label}
              {value === opt.value && <Check className="w-3 h-3 text-gray-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface SortDropdownProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
}

export function SortDropdown({
  value,
  options,
  onChange,
  label = "Sort",
}: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);
  const listId = useId();

  const selected = options.find((o) => o.value === value);

  function choose(next: string) {
    onChange(next);
    setIsOpen(false);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-1.5 h-8 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-all whitespace-nowrap"
      >
        <ArrowUpDown className="w-3 h-3 text-gray-400" />
        <span className="text-gray-400">{label}:</span> {selected?.label ?? value}
        <ChevronDown className="w-3 h-3 text-gray-500" />
      </button>

      {isOpen && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 right-0 w-40 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => choose(opt.value)}
              className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
            >
              {opt.label}
              {value === opt.value && <Check className="w-3 h-3 text-gray-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
