import { useEffect, useState } from "react";
import type { BorrboxItem } from "../types";

const STORAGE_KEY = "borrbox-items";

function loadItemsFromStorage(): BorrboxItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed as BorrboxItem[];
  } catch {
    return [];
  }
}

function saveItemsToStorage(items: BorrboxItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore quota errors etc
  }
}

export function useBorrboxStore() {
  const [items, setItems] = useState<BorrboxItem[]>(() => loadItemsFromStorage());

  // persist whenever items change
  useEffect(() => {
    saveItemsToStorage(items);
  }, [items]);

  function addItem(item: BorrboxItem) {
    // assume AddItemSheet already gave us a full BorrboxItem with id etc
    setItems(prev => [...prev, item]);
  }

  function updateItem(id: string, updates: Partial<BorrboxItem>) {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updates } : item))
    );
  }

  function deleteItem(id: string) {
    setItems(prev => prev.filter(item => item.id !== id));
  }

  function markReturned(id: string) {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, returned: true } : item
      )
    );
  }

  // ---- stats ----

  const activeItems = items.filter(i => !i.returned);

  const todayMidnight = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();

  const oneWeekAhead = todayMidnight + 7 * 24 * 60 * 60 * 1000;

  let overdueCount = 0;
  let dueThisWeekCount = 0;
  let moneyOwedToMe = 0;
  let moneyIOwe = 0;

  for (const item of activeItems) {
    const due = new Date(item.dueDate);
    due.setHours(0, 0, 0, 0);
    const dueTime = due.getTime();

    if (dueTime < todayMidnight) {
      overdueCount++;
    } else if (dueTime <= oneWeekAhead) {
      dueThisWeekCount++;
    }

    if (item.type === "money" && typeof item.amount === "number") {
      if (item.direction === "they_borrowed") {
        moneyOwedToMe += item.amount;
      } else if (item.direction === "i_borrowed") {
        moneyIOwe += item.amount;
      }
    }
  }

  return {
    items,
    addItem,
    updateItem,
    deleteItem,
    markReturned,
    overdueCount,
    dueThisWeekCount,
    moneyOwedToMe,
    moneyIOwe,
  };
}
