import { useState, useRef } from "react";
import { useReborroStore } from "../hooks/useReborroStore";
import { useReborroHistory } from "../hooks/useReborroHistory";
import type { ReborroItem } from "../types";

async function exportAllDataAsJsonString(items: ReborroItem[]): Promise<string> {
  return JSON.stringify(items, null, 2);
}

async function importDataFromJsonString(json: string): Promise<ReborroItem[]> {
  const parsed = JSON.parse(json);
  
  if (!Array.isArray(parsed)) {
    throw new Error("Invalid file format. Expected an array of items.");
  }

  const isValid = parsed.every((item: unknown) => {
    if (typeof item !== "object" || item === null) return false;
    const i = item as Record<string, unknown>;
    return (
      typeof i.id === "string" &&
      typeof i.type === "string" &&
      (i.type === "money" || i.type === "object") &&
      typeof i.personName === "string" &&
      typeof i.borrowedAt === "string" &&
      typeof i.dueDate === "string" &&
      typeof i.returned === "boolean" &&
      typeof i.direction === "string" &&
      (i.direction === "they_borrowed" || i.direction === "i_borrowed")
    );
  });

  if (!isValid) {
    throw new Error("Invalid file format. Items do not match expected structure.");
  }

  return parsed as ReborroItem[];
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

export function BackupRestore() {
  const { items } = useReborroStore();
  const { recentHistory, deleteReturnedItem } = useReborroHistory();
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadBackup = async () => {
    try {
      setIsExporting(true);
      const json = await exportAllDataAsJsonString(items);

      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.href = url;
      a.download = `reborro-backup-${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Backup download failed", err);
      alert("Backup download failed. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const text = await file.text();
      const importedItems = await importDataFromJsonString(text);
      
      // Save to localStorage
      localStorage.setItem("reborro-items", JSON.stringify(importedItems));
      
      // Reload to apply changes
      window.location.reload();
    } catch (err) {
      console.error("Import failed", err);
      setImportError(
        err instanceof Error ? err.message : "Import failed. Check that this is a valid Reborro backup file."
      );
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImportBackup = () => {
    fileInputRef.current?.click();
  };

  // Format history items for display
  const returnedItems = recentHistory.map((item) => ({
    id: item.id,
    name: item.personName?.trim() || "Unknown",
    itemName: item.type === "money" 
      ? `${item.amount?.toFixed(2) || "0.00"} (Money)` 
      : item.itemName?.trim() || "Item",
    returnedDateLabel: item.returnedAt ? formatDate(item.returnedAt) : "Unknown",
  }));

  const deleteReturned = (id: string) => {
    deleteReturnedItem(id);
  };

  return (
    <div className="w-full compact-section">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
      >
        <span>Backup & Restore</span>
        <span className="text-zinc-400">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-3 p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
          <div className="space-y-3">
            {/* Download */}
            <button
              onClick={handleDownloadBackup}
              disabled={isExporting}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {isExporting ? "Preparing…" : "Download backup file"}
            </button>

            {/* Import */}
            <button
              onClick={handleImportBackup}
              disabled={isImporting}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 hover:bg-zinc-800 transition disabled:opacity-50"
            >
              {isImporting ? "Importing…" : "Import backup file"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFileChange}
              className="hidden"
            />

            {importError && (
              <p className="text-xs text-red-400">
                {importError}
              </p>
            )}

            {/* History – NO ICON, centered text */}
            <button
              onClick={() => setHistoryOpen((v) => !v)}
              className="w-full rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-100 hover:bg-zinc-800 transition"
            >
              History (Returned)
            </button>
          </div>

          {/* History panel underneath */}
          {historyOpen && returnedItems.length > 0 && (
            <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 space-y-2">
              {returnedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-sm text-zinc-100 flex justify-between"
                >
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-zinc-400">{item.itemName}</div>
                  </div>
                  <span className="text-xs text-zinc-500">{item.returnedDateLabel}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
