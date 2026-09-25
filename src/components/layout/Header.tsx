import { Loader2, LayoutGrid } from "lucide-react";
import { Avatar } from "../ui/Avatar";

export function Header({ isSyncing = false }: { isSyncing?: boolean }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-900 text-white">
            <LayoutGrid className="w-4 h-4" />
          </div>
          <span className="text-sm font-semibold text-gray-900">
            Requests Portal
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isSyncing && (
            <div className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin" />
              <span className="text-xs text-gray-400">Syncing...</span>
            </div>
          )}
          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Avatar initials="KL" color="#4F46E5" size={30} />
            <span className="text-sm text-gray-700 font-medium hidden sm:block">
              Kai Lawson
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
