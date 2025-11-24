import { useState, useRef } from "react";
import { useReborroStore } from "../hooks/useReborroStore";
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

function ChevronDown({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-500"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ChevronUp({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-zinc-500"
    >
      <path d="m18 15-6-6-6 6" />
    </svg>
  );
}

export function BackupRestore() {
  const { items } = useReborroStore();
  const [open, setOpen] = useState(false);
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

  const handleShareBackup = async () => {
    try {
      setIsExporting(true);
      const json = await exportAllDataAsJsonString(items);

      const blob = new Blob([json], { type: "application/json" });
      const file = new File([blob], "reborro-backup.json", {
        type: "application/json",
      });

      if ((navigator as any).share && (navigator as any).canShare?.({ files: [file] })) {
        await (navigator as any).share({
          title: "Reborro backup",
          text: "Here is my Reborro backup file. Keep this safe.",
          files: [file],
        });
      } else {
        // Fallback: just download if share isn't supported
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "reborro-backup.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        alert(
          "Sharing is not supported on this device. The backup has been downloaded instead."
        );
      }
    } catch (err) {
      console.error("Backup share failed", err);
      alert("Backup share failed. Please try again.");
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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mt-6 w-full">
      
      {/* Collapsed Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900/60 border border-zinc-800 rounded-xl text-sm text-zinc-400"
      >
        <span>Backup & Restore</span>
        {open ? (
          <ChevronUp size={18} />
        ) : (
          <ChevronDown size={18} />
        )}
      </button>

      {/* Expanded Content */}
      {open && (
        <div className="mt-3 bg-zinc-900/70 border border-zinc-800 rounded-xl p-4 space-y-3">
          
          <button 
            onClick={handleShareBackup}
            disabled={isExporting}
            className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium text-sm hover:bg-emerald-500 disabled:opacity-50"
          >
            {isExporting ? "Preparing…" : "Share backup (WhatsApp, email)"}
          </button>

          <button 
            onClick={handleDownloadBackup}
            disabled={isExporting}
            className="w-full bg-zinc-800 text-white/80 py-3 rounded-lg font-medium text-sm hover:bg-zinc-700 disabled:opacity-50"
          >
            {isExporting ? "Preparing…" : "Download backup file"}
          </button>

          <button 
            onClick={handleImportClick}
            disabled={isImporting}
            className="w-full bg-zinc-800 text-white/80 py-3 rounded-lg font-medium text-sm hover:bg-zinc-700 disabled:opacity-50"
          >
            {isImporting ? "Importing…" : "Import backup file"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImportFileChange}
            className="hidden"
          />

          {importError && (
            <p className="text-xs text-red-400">
              {importError}
            </p>
          )}

          <p className="text-[11px] text-zinc-500 leading-relaxed pt-1">
            Tip: On your phone, choose "Share backup" and send it to your own WhatsApp chat. 
            It becomes your permanent backup.
          </p>

        </div>
      )}
    </div>
  );
}

