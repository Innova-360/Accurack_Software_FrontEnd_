export interface ExpenseItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

export interface ExpenseItemWithCategory extends ExpenseItem {
  category: string;
}

export interface ExpenseCategory {
  name: string;
  items: ExpenseItem[];
}
