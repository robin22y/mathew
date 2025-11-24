import { useEffect, useState } from "react";
import type { ReborroItem } from "../types";

const STORAGE_KEY = "reborro-history";

function loadHistoryFromStorage(): ReborroItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as ReborroItem[];
  } catch {
    return [];
  }
}

function saveHistoryToStorage(history: ReborroItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore quota errors etc
  }
}

export function useReborroHistory() {
  const [history, setHistory] = useState<ReborroItem[]>(() => loadHistoryFromStorage());

  // persist whenever history changes
  useEffect(() => {
    saveHistoryToStorage(history);
  }, [history]);

  function addToHistory(item: ReborroItem) {
    const historyItem: ReborroItem = {
      ...item,
      returned: true,
      returnedAt: Date.now(),
    };
    setHistory(prev => [historyItem, ...prev]);
  }

  function deleteReturnedItem(id: string) {
    setHistory(prev => prev.filter(item => item.id !== id));
  }

  function purgeOldHistory() {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
    setHistory(prev => prev.filter(item => {
      if (!item.returnedAt) return true; // Keep items without returnedAt (shouldn't happen)
      return item.returnedAt >= ninetyDaysAgo;
    }));
  }

  // Auto-purge old entries on load
  useEffect(() => {
    purgeOldHistory();
  }, []);

  // Get most recent 10 items, sorted by returnedAt descending
  const recentHistory = history
    .filter(item => item.returnedAt !== undefined)
    .sort((a, b) => (b.returnedAt || 0) - (a.returnedAt || 0))
    .slice(0, 10);

  return {
    history,
    recentHistory,
    addToHistory,
    deleteReturnedItem,
    purgeOldHistory,
  };
}

