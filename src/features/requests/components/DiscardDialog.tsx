import { AlertTriangle } from "lucide-react";

interface DiscardDialogProps {
  onKeepEditing: () => void;
  onDiscard: () => void;
}

export function DiscardDialog({ onKeepEditing, onDiscard }: DiscardDialogProps) {
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-gray-900/30 px-4">
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="discard-title"
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm border border-gray-200 dialog-enter"
      >
        <div className="px-6 pt-6 pb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <h3 id="discard-title" className="text-sm font-semibold text-gray-900 mb-1">
            Discard unsaved changes?
          </h3>
          <p className="text-sm text-gray-500">
            You have unsaved modifications on this request. This action cannot be undone.
          </p>
        </div>
        <div className="px-6 py-4 flex justify-end gap-2 border-t border-gray-100">
          <button
            type="button"
            autoFocus
            onClick={onKeepEditing}
            className="h-8 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={onDiscard}
            className="h-8 px-4 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
}
