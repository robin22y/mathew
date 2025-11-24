import { useState } from "react";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import type { ReborroItem } from "../types";

interface HistoryProps {
  history: ReborroItem[];
  onDelete?: (id: string) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = now.getTime() - timestamp;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}

export function History({ history, onDelete }: HistoryProps) {
  const [open, setOpen] = useState(false);

  if (history.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 w-full">
      {/* Collapsed Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-400"
      >
        <span>History (Returned)</span>
        {open ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </button>

      {/* Expanded Content */}
      {open && (
        <div className="mt-3 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
          <div className="space-y-2">
            {history.map((item) => {
              const displayName = item.personName?.trim() || "Unknown";
              const displayItem = item.type === "money" 
                ? `${item.amount?.toFixed(2) || "0.00"} (Money)` 
                : item.itemName?.trim() || "Item";
              const returnedDate = item.returnedAt 
                ? formatDate(item.returnedAt) 
                : "Unknown";

              return (
                <div
                  key={item.id}
                  className="bg-black/40 border border-white/5 rounded-xl p-4 my-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate">
                        {displayName}
                      </div>
                      <div className="text-zinc-500 text-xs mt-1 truncate">
                        {displayItem}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-zinc-500 text-xs whitespace-nowrap text-right">
                        {returnedDate}
                      </div>
                      {onDelete && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(item.id);
                          }}
                          className="text-zinc-500 hover:text-red-400 transition cursor-pointer"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

