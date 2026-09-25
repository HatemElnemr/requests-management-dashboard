import { useCallback, useMemo, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Pagination } from "@/components/ui/Pagination";
import { Toast } from "@/components/ui/Toast";
import { RequestTable } from "@/features/requests/components/RequestTable";
import { ActiveFilters } from "@/features/requests/components/ActiveFilters";
import { ControlsBar } from "@/features/requests/components/ControlsBar";
import { EditDrawer } from "@/features/requests/components/EditDrawer";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  PRIORITY_SELECT_OPTIONS,
  SORT_OPTIONS,
  STATUSES,
  STATUS_LABELS,
  STATUS_SELECT_OPTIONS,
} from "@/features/requests/data/MockRequests";
import { useRequestParams } from "@/features/requests/hooks/useRequestParams";
import {
  useDeleteRequest,
  useRequests,
  useUpdateRequest,
  useUpdateRequestStatus,
} from "@/features/requests/hooks/useRequests";
import type { FilterChip, RequestItem, RequestStatus } from "@/features/requests/types/requests";

interface ToastState {
  message: string;
  tone: "error" | "success";
}

// نمررها كـ unknown حتى لا نضطر للاعتماد على narrowing نوع error
// الذي يصبح never داخل شروط JSX
function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Something went wrong while loading requests.";
}

export default function RequestsListPage() {
  const { filters, setFilter, resetFilters } = useRequestParams();

  const { data, isPending, isFetching, isError, error, refetch } = useRequests(filters);
  // نغلّف الاستدعاء داخل closure لأن TS يضيّق refetch إلى never
  // عند تضييق الـ union حسب isError داخل JSX
  const reload = () => refetch();
  const statusMutation = useUpdateRequestStatus();
  const saveMutation = useUpdateRequest();
  const deleteMutation = useDeleteRequest();

  const [toast, setToast] = useState<ToastState | null>(null);
  const [editing, setEditing] = useState<RequestItem | null>(null);

  const showToast = useCallback((message: string, tone: ToastState["tone"]) => {
    setToast({ message, tone });
  }, []);

  const rows = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const start = total === 0 ? 0 : (filters.page - 1) * filters.limit + 1;
  const end = Math.min(filters.page * filters.limit, total);

  // الفلاتر النشطة مشتقة من الـ URL بدل تخزينها مرتين
  const chips = useMemo<FilterChip[]>(() => {
    const list: FilterChip[] = [];
    if (filters.search) list.push({ id: "search", label: `Search: ${filters.search}` });
    if (filters.status) {
      list.push({ id: "status", label: `Status: ${STATUS_LABELS[filters.status]}` });
    }
    if (filters.priority) {
      list.push({ id: "priority", label: `Priority: ${PRIORITY_LABELS[filters.priority]}` });
    }
    return list;
  }, [filters.search, filters.status, filters.priority]);

  const handleRemoveChip = (id: string) => {
    if (id === "search") setFilter("search", "");
    if (id === "status") setFilter("status", "");
    if (id === "priority") setFilter("priority", "");
  };

  const handleStatusChange = (id: string, status: RequestStatus) => {
    statusMutation.mutate(
      { id, status },
      {
        onError: () => showToast("Could not update status. The change was reverted.", "error"),
        onSuccess: () => showToast("Status updated.", "success"),
      },
    );
  };

  const handleDelete = (request: RequestItem) => {
    deleteMutation.mutate(
      { id: request.id },
      {
        onError: () => showToast("Could not delete the request.", "error"),
        onSuccess: () => showToast(`${request.id} deleted.`, "success"),
      },
    );
  };

  // الـ drawer يتولى بنفسه تأكيد الإلغاء عند وجود تعديلات غير محفوظة
  const closeDrawer = () => setEditing(null);

  const handleSave = (updated: RequestItem) => {
    saveMutation.mutate(updated, {
      onSuccess: () => {
        setEditing(null);
        showToast("Changes saved.", "success");
      },
      onError: () => showToast("Could not save changes.", "error"),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header isSyncing={isFetching} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-0.5">All Requests</h1>
            <p className="text-sm text-gray-500">
              {total} total request{total === 1 ? "" : "s"}
              {chips.length > 0 ? " matching your filters" : " across all teams"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => reload()}
            disabled={isFetching}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <ControlsBar
          searchQuery={filters.search}
          onSearchChange={(value) => setFilter("search", value)}
          selectedStatus={filters.status}
          onStatusChange={(value) => setFilter("status", value)}
          selectedPriority={filters.priority}
          onPriorityChange={(value) => setFilter("priority", value)}
          selectedSort={filters.sortBy}
          onSortChange={(value) => setFilter("sortBy", value)}
          statusOptions={STATUS_SELECT_OPTIONS}
          priorityOptions={PRIORITY_SELECT_OPTIONS}
          sortOptions={SORT_OPTIONS}
        />

        <ActiveFilters
          filters={chips}
          onRemove={handleRemoveChip}
          onClearAll={resetFilters}
        />

        {/* خطأ التحميل الأولي، أما فشل التحديث الخلفي فيبقى الجدول ظاهراً.
            نتحقّق من غياب البيانات بدلاً من isPending، لأن الأخير يصبح false
            بمجرد وصول الحالة إلى error في react-query v5 */}
        {isError && !data ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <p className="text-sm text-gray-600">{getErrorMessage(error)}</p>
            <button
              type="button"
              onClick={() => reload()}
              className="h-8 px-4 text-sm font-medium text-white bg-gray-900 rounded-md hover:bg-gray-800 transition-colors"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200">
            {isError && !isPending && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Could not refresh data — showing the last successful result.
                <button
                  type="button"
                  onClick={() => reload()}
                  className="ml-auto underline underline-offset-2 hover:text-amber-900"
                >
                  Retry
                </button>
              </div>
            )}

            <RequestTable
              requests={rows}
              statuses={STATUSES}
              onStatusChange={handleStatusChange}
              onView={setEditing}
              onDelete={handleDelete}
              isLoading={isPending}
              isUpdatingStatus={statusMutation.isPending}
            />

            <Pagination
              start={start}
              end={end}
              totalResults={total}
              currentPage={filters.page}
              totalPages={totalPages}
              onPageChange={(page) => setFilter("page", page)}
            />
          </div>
        )}
      </main>

      {editing && (
        <EditDrawer
          key={editing.id}
          request={editing}
          statuses={STATUSES}
          priorities={PRIORITIES}
          onSave={handleSave}
          onClose={closeDrawer}
          isSaving={saveMutation.isPending}
        />
      )}

      {toast && <Toast message={toast.message} tone={toast.tone} onClose={() => setToast(null)} />}
    </div>
  );
}
