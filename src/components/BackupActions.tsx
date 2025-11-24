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
    <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100">Backup & Restore</h2>
          <p className="text-xs text-neutral-400">
            Keep a copy of your Reborro data. You can share it to WhatsApp or email
            yourself for later.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={handleDownloadBackup}
          disabled={isExporting}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-100 hover:bg-neutral-700 disabled:opacity-50"
        >
          {isExporting ? "Preparing…" : "Download backup"}
        </button>

        <button
          onClick={handleShareBackup}
          disabled={isExporting}
          className="inline-flex items-center justify-center rounded-lg bg-emerald-500/90 px-3 py-2 text-xs font-semibold text-black hover:bg-emerald-400 disabled:opacity-50"
        >
          {isExporting ? "Preparing…" : "Share backup (WhatsApp, email…)"}
        </button>

        <label className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-xs font-medium text-neutral-100 hover:bg-neutral-700">
          {isImporting ? "Importing…" : "Import backup file"}
          <input
            type="file"
            accept="application/json"
            onChange={handleImportFileChange}
            className="hidden"
          />
        </label>
      </div>

      {importError && (
        <p className="text-xs text-red-400">
          {importError}
        </p>
      )}

      <p className="text-[11px] leading-snug text-neutral-500">
        Tip: On your phone, use <span className="font-semibold">Share backup</span> and
        choose WhatsApp to send the file to yourself or to someone you trust. You can
        later re-import it on any device running Reborro.
      </p>
    </div>
  );
};

