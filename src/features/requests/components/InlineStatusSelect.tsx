import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { StatusBadge } from "./RequestBadges";
import { STATUS_LABELS } from "@/features/requests/data/MockRequests";
import type { RequestStatus, SelectOption } from "@/features/requests/types/requests";

interface InlineStatusSelectProps {
  value: RequestStatus;
  statuses: RequestStatus[];
  onChange?: (status: RequestStatus) => void;
  disabled?: boolean;
}

export function InlineStatusSelect({
  value,
  statuses,
  onChange,
  disabled = false,
}: InlineStatusSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);
  const listId = useId();

  const options: SelectOption[] = statuses.map((s) => ({
    value: s,
    label: STATUS_LABELS[s],
  }));

  function choose(next: RequestStatus) {
    onChange?.(next);
    setIsOpen(false);
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={`Change status, currently ${STATUS_LABELS[value]}`}
        onClick={() => setIsOpen((open) => !open)}
        className="inline-flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity bg-transparent border-none p-0 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <StatusBadge status={value} />
        <ChevronDown className="w-2.5 h-2.5 text-gray-400 ml-0.5" />
      </button>

      {isOpen && (
        <div
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 left-0 w-44 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={value === opt.value}
              onClick={() => choose(opt.value as RequestStatus)}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
            >
              <StatusBadge status={opt.value as RequestStatus} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
