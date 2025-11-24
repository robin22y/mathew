export type ReborroItemType = "money" | "object";

export interface ReborroItem {
  id: string;
  type: ReborroItemType;
  personName: string;
  amount?: number;
  itemName?: string;
  notes?: string;
  borrowerPhone?: string;
  borrowedAt: string;
  dueDate: string;
  returned: boolean;
  direction: "they_borrowed" | "i_borrowed";
  borrowDirection?: "they_owe_me" | "i_owe_them";
}
