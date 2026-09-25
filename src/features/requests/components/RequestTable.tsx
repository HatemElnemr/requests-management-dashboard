import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useClickOutside } from "@/hooks/useClickOutside";
import { Avatar } from "@/components/ui/Avatar";
import { PriorityBadge } from "./RequestBadges";
import { InlineStatusSelect } from "./InlineStatusSelect";
import type { RequestItem, RequestStatus } from "@/features/requests/types/requests";

interface RowActionsProps {
  onEdit: () => void;
  onDelete: () => void;
}

function RowActions({ onEdit, onDelete }: RowActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false), isOpen);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Row actions"
        onClick={() => setIsOpen((open) => !open)}
        className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-all"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute z-50 right-0 mt-1 w-36 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onEdit();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setIsOpen(false);
              onDelete();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

interface RequestTableProps {
  requests: RequestItem[];
  statuses: RequestStatus[];
  onStatusChange: (id: string, status: RequestStatus) => void;
  onView: (request: RequestItem) => void;
  onDelete: (request: RequestItem) => void;
  isLoading?: boolean;
  isUpdatingStatus?: boolean;
}

export function RequestTable({
  requests,
  statuses,
  onStatusChange,
  onView,
  onDelete,
  isLoading = false,
  isUpdatingStatus = false,
}: RequestTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-200">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {["Title", "Status", "Priority", "Owner", "Created", "Updated", ""].map(
              (h, i) => (
                <th
                  key={i}
                  className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 tracking-wide whitespace-nowrap"
                >
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-sm text-gray-400">
                <span className="inline-flex items-center gap-2">
                  <span className="spinner w-3.5 h-3.5 rounded-full border-2 border-gray-300 border-t-gray-500" />
                  Loading requests…
                </span>
              </td>
            </tr>
          ) : requests.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-16 text-sm text-gray-400">
                No requests match your filters.
              </td>
            </tr>
          ) : (
            requests.map((req, idx) => (
              <tr
                key={req.id}
                className={`hover:bg-gray-50/50 ${idx < requests.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <td className="px-4 py-3.5 max-w-75">
                  <div>
                    <p className="text-xs font-mono text-gray-400 mb-0.5">{req.id}</p>
                    <p className="text-sm font-medium text-gray-900 leading-snug">
                      {req.title}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <InlineStatusSelect
                    value={req.status}
                    statuses={statuses}
                    onChange={(status) => onStatusChange(req.id, status)}
                    disabled={isUpdatingStatus}
                  />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <PriorityBadge priority={req.priority} />
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <Avatar initials={req.ownerInitials} color={req.ownerColor} size={24} />
                    <span className="text-sm text-gray-700">{req.owner}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-gray-400">
                  {req.createdAt}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap text-xs font-mono text-gray-500">
                  {req.updatedAt}
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onView(req)}
                      className="h-7 px-3 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-all whitespace-nowrap"
                    >
                      View
                    </button>
                    <RowActions
                      onEdit={() => onView(req)}
                      onDelete={() => onDelete(req)}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
