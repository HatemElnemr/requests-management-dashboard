import type { ElementType } from "react";
import { ArrowDown, Diamond, ArrowUp, Flag } from "lucide-react";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/features/requests/data/MockRequests";
import type {
  RequestStatus,
  RequestPriority,
} from "@/features/requests/types/requests";

const STATUS_STYLE: Record<
  RequestStatus,
  { dot: string; bg: string; text: string; border: string }
> = {
  open: {
    dot: "bg-gray-500",
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
  },
  in_progress: {
    dot: "bg-amber-600",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  completed: {
    dot: "bg-emerald-600",
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  canceled: {
    dot: "bg-red-600",
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const cfg = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border whitespace-nowrap ${cfg.bg} ${cfg.text} ${cfg.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
      {/* نعرض التسمية المقروءة ونُبقي القيمة الخام في البيانات و الـ URL */}
      {STATUS_LABELS[status]}
    </span>
  );
}

const PRIORITY_CONFIG: Record<
  RequestPriority,
  { Icon: ElementType; textClass: string }
> = {
  low: { Icon: ArrowDown, textClass: "text-gray-500" },
  medium: { Icon: Diamond, textClass: "text-gray-700" },
  high: { Icon: ArrowUp, textClass: "text-amber-600" },
  urgent: { Icon: Flag, textClass: "text-red-600" },
};

export function PriorityBadge({ priority }: { priority: RequestPriority }) {
  const { Icon, textClass } = PRIORITY_CONFIG[priority];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${textClass}`}
    >
      <Icon className="w-3 h-3" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
