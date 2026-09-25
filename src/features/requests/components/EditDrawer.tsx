import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { STATUS_LABELS, PRIORITY_LABELS } from "@/features/requests/data/MockRequests";
import { DiscardDialog } from "./DiscardDialog";
import type {
  RequestItem,
  RequestPriority,
  RequestStatus,
} from "@/features/requests/types/requests";

interface RequestFormValues {
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  owner: string;
}

interface EditDrawerProps {
  request: RequestItem;
  statuses: RequestStatus[];
  priorities: RequestPriority[];
  onSave: (request: RequestItem) => void;
  onClose: () => void;
  isSaving?: boolean;
}

function toFormValues(request: RequestItem): RequestFormValues {
  return {
    title: request.title,
    status: request.status,
    priority: request.priority,
    owner: request.owner,
  };
}

export function EditDrawer({
  request,
  statuses,
  priorities,
  onSave,
  onClose,
  isSaving = false,
}: EditDrawerProps) {
  const [isDiscardOpen, setIsDiscardOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<RequestFormValues>({
    defaultValues: toFormValues(request),
    // نتحقق عند مغادرة الحقل بدل كل ضغطة مفتاح، مع بقاء تتبّع isDirty فوري
    mode: "onBlur",
  });

  // isDirty يأتي من react-hook-form مباشرة، فنستغني عن المقارنة اليدوية
  // وعن رفع الحالة للأب عبر onDirtyChange

  // نحمي التعديلات غير المحفوظة من فقدانها عند إغلاق التبويب أو إعادة التحميل
  useEffect(() => {
    if (!isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  function requestClose() {
    if (isDirty) {
      setIsDiscardOpen(true);
    } else {
      onClose();
    }
  }

  const submit = handleSubmit((values) => {
    onSave({ ...request, ...values });
  });

  const field =
    "w-full px-3 py-2.5 text-sm text-gray-900 bg-white border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all placeholder-gray-400";
  const validField = `${field} border-gray-200 focus:border-gray-400`;
  const invalidField = `${field} border-red-400 focus:border-red-500 focus:ring-red-500/10`;
  const selectField = "cursor-pointer";

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-gray-900/20 overlay-enter"
        onClick={requestClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Edit request ${request.id}`}
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl w-full max-w-130 border-l border-gray-200 drawer-enter"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <p className="text-xs font-mono text-gray-400 mb-0.5">{request.id}</p>
            <h2 className="text-base font-semibold text-gray-900">Edit Request</h2>
          </div>
          <button
            type="button"
            aria-label="Close drawer"
            onClick={requestClose}
            className="flex items-center justify-center w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            <div>
              <label
                htmlFor="drawer-title"
                className="block text-xs font-medium text-gray-500 mb-1.5"
              >
                Title
              </label>
              <input
                id="drawer-title"
                aria-invalid={errors.title ? "true" : "false"}
                aria-describedby={errors.title ? "drawer-title-error" : undefined}
                className={errors.title ? invalidField : validField}
                placeholder="Request title..."
                {...register("title", {
                  required: "Title is required",
                  validate: (value) =>
                    value.trim().length > 0 || "Title cannot be only spaces",
                })}
              />
              {errors.title && (
                <p id="drawer-title-error" role="alert" className="mt-1.5 text-xs text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="drawer-status"
                  className="block text-xs font-medium text-gray-500 mb-1.5"
                >
                  Status
                </label>
                <select
                  id="drawer-status"
                  className={`${validField} ${selectField}`}
                  {...register("status", { required: "Status is required" })}
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="drawer-priority"
                  className="block text-xs font-medium text-gray-500 mb-1.5"
                >
                  Priority
                </label>
                <select
                  id="drawer-priority"
                  className={`${validField} ${selectField}`}
                  {...register("priority", { required: "Priority is required" })}
                >
                  {priorities.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="drawer-owner"
                className="block text-xs font-medium text-gray-500 mb-1.5"
              >
                Owner
              </label>
              <input
                id="drawer-owner"
                aria-invalid={errors.owner ? "true" : "false"}
                aria-describedby={errors.owner ? "drawer-owner-error" : undefined}
                className={errors.owner ? invalidField : validField}
                placeholder="Owner name..."
                {...register("owner", {
                  required: "Owner is required",
                  validate: (value) =>
                    value.trim().length > 0 || "Owner cannot be only spaces",
                })}
              />
              {errors.owner && (
                <p id="drawer-owner-error" role="alert" className="mt-1.5 text-xs text-red-600">
                  {errors.owner.message}
                </p>
              )}
            </div>

            <div className="pt-2">
              <div className="rounded-lg p-4 bg-gray-50 border border-gray-200">
                <p className="text-xs font-medium text-gray-500 mb-2">Request Details</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Created</span>
                    <span className="font-mono text-gray-600">{request.createdAt}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Last updated</span>
                    <span className="font-mono text-gray-600">{request.updatedAt}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Request ID</span>
                    <span className="font-mono text-gray-600">{request.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isDirty ? (
            <div className="px-6 py-3 flex items-center justify-between gap-3 bg-amber-50 border-t border-amber-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-xs font-medium text-amber-800">
                  You have unsaved changes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => reset(toFormValues(request))}
                  className="h-7 px-3 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
                >
                  Revert
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="h-7 px-3 text-xs font-semibold text-white bg-gray-900 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </div>
          ) : (
            <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
              <button
                type="button"
                onClick={requestClose}
                className="h-8 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </form>
      </div>

      {isDiscardOpen && (
        <DiscardDialog
          onKeepEditing={() => setIsDiscardOpen(false)}
          onDiscard={() => {
            setIsDiscardOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}
