export type BorrboxItemType = "money" | "object";

export interface BorrboxItem {
  id: string;
  type: BorrboxItemType;
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
