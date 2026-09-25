import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  start: number;
  end: number;
  totalResults: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** يبني قائمة أرقام الصفحات مع علامات "..." للصفحات المخفية */
function buildPageItems(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>([1, total, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const items: Array<number | "gap"> = [];
  let previous = 0;

  for (const page of sorted) {
    if (previous && page - previous > 1) items.push("gap");
    items.push(page);
    previous = page;
  }

  return items;
}

export function Pagination({
  start,
  end,
  totalResults,
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalResults === 0) return null;

  const items = buildPageItems(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 flex-wrap gap-2">
      <p className="text-xs text-gray-500">
        Showing <span className="font-medium text-gray-700">{start}</span> to{" "}
        <span className="font-medium text-gray-700">{end}</span> of{" "}
        <span className="font-medium text-gray-700">{totalResults}</span> results
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
          className="h-7 px-2.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-3 h-3" />
          Prev
        </button>

        {items.map((item, index) =>
          item === "gap" ? (
            <span key={`gap-${index}`} className="text-xs text-gray-400 px-1">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-current={currentPage === item ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={`w-7 h-7 text-xs font-medium rounded-md transition-all border ${
                currentPage === item
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
          className="h-7 px-2.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          Next
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
