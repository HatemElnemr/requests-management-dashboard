import { useState } from "react";
import { Search, X } from "lucide-react";
import { FilterDropdown, SortDropdown } from "@/components/ui/Dropdowns";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";
import type {
  RequestPriority,
  RequestSortBy,
  RequestStatus,
  SelectOption,
} from "@/features/requests/types/requests";

/** مدّة التهدئة قبل إرسال قيمة البحث إلى الـ URL (وبالتالي إلى الـ API) */
export const SEARCH_DEBOUNCE_MS = 300;

interface ControlsBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedStatus: RequestStatus | "";
  onStatusChange: (value: RequestStatus | "") => void;
  selectedPriority: RequestPriority | "";
  onPriorityChange: (value: RequestPriority | "") => void;
  selectedSort: RequestSortBy;
  onSortChange: (value: RequestSortBy) => void;
  statusOptions: SelectOption[];
  priorityOptions: SelectOption[];
  sortOptions: SelectOption[];
}

export function ControlsBar({
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedPriority,
  onPriorityChange,
  selectedSort,
  onSortChange,
  statusOptions,
  priorityOptions,
  sortOptions,
}: ControlsBarProps) {
  const [query, setQuery] = useState(searchQuery);
  const [lastProp, setLastProp] = useState(searchQuery);

  // نزامن الحقل المحلي عند تغيّر القيمة من الخارج (Clear all، إزالة chip،
  // أو تنقّل في المتصفّح). نعدّل الحالة أثناء الرسم بدل effect
  // تفادياً لإعادة رسم غير ضرورية.
  if (searchQuery !== lastProp) {
    setLastProp(searchQuery);
    setQuery(searchQuery);
  }

  // الحقل يبقى متجاوباً فوراً، لكن إرسال البحث للـ URL يتأخر 300ms
  // حتى لا نطلق طلباً مع كل ضغطة مفتاح
  const emitSearch = useDebouncedCallback(onSearchChange, SEARCH_DEBOUNCE_MS);

  function handleSearchInput(value: string) {
    setQuery(value);
    emitSearch(value);
  }

  function handleClearSearch() {
    // المسح إجراء مقصود، ننفّذه فوراً ونلغي أي بحث مؤجّل معلّق
    emitSearch.cancel();
    setQuery("");
    onSearchChange("");
  }

  return (
    <div className="bg-white rounded-lg px-4 py-3 mb-3 flex flex-wrap items-center gap-3 border border-gray-200">
      <div className="relative flex-1 min-w-55 max-w-85">
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearchInput(e.target.value)}
          aria-label="Search requests"
          className="w-full h-8 pl-8 pr-3 text-sm text-gray-900 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-400 transition-all placeholder-gray-400"
          placeholder="Search by title, owner or ID..."
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={handleClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <FilterDropdown
          label="Status"
          allLabel="All Statuses"
          options={statusOptions}
          value={selectedStatus}
          onChange={(v) => onStatusChange(v as RequestStatus | "")}
        />
        <FilterDropdown
          label="Priority"
          allLabel="All Priorities"
          options={priorityOptions}
          value={selectedPriority}
          onChange={(v) => onPriorityChange(v as RequestPriority | "")}
        />
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <SortDropdown
          options={sortOptions}
          value={selectedSort}
          onChange={(v) => onSortChange(v as RequestSortBy)}
        />
      </div>
    </div>
  );
}
