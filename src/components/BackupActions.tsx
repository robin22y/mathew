import React, { useState } from "react";
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

export const BackupActions: React.FC = () => {
  const { items } = useReborroStore();
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

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
        // On mobile, this opens the share sheet:
        // user can pick WhatsApp, email, Drive, etc.
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
      event.target.value = ""; // reset file input
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">Backup & Restore</h2>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Keep your Reborro data safe. Easily move it to a new device or store a copy for later.
        </p>
      </div>

      {/* PRIMARY */}
      <button
        onClick={handleShareBackup}
        disabled={isExporting}
        className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
      >
        {isExporting ? "Preparing…" : "Share backup (WhatsApp, email)"}
      </button>

      {/* DOWNLOAD */}
      <button
        onClick={handleDownloadBackup}
        disabled={isExporting}
        className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-100 hover:bg-zinc-700 disabled:opacity-50"
      >
        {isExporting ? "Preparing…" : "Download backup file"}
      </button>

      {/* IMPORT */}
      <label className="w-full block">
        <div className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-100 text-center hover:bg-zinc-700 cursor-pointer">
          {isImporting ? "Importing…" : "Import backup file"}
        </div>
        <input
          type="file"
          accept="application/json"
          onChange={handleImportFileChange}
          className="hidden"
        />
      </label>

      {importError && (
        <p className="text-xs text-red-400">
          {importError}
        </p>
      )}

      <p className="text-[11px] leading-snug text-zinc-500 pt-1">
        Tip: On your phone, choose <span className="font-semibold">Share backup</span> and
        send it to your own WhatsApp chat. It becomes your permanent backup.
      </p>
    </div>
  );
};

