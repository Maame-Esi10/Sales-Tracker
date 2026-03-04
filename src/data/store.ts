// Shared reactive store using simple pub/sub pattern
// This allows menu items and staff to stay in sync across pages

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  cost: number;
}

export interface SaleDetail {
  id: string;
  items: { name: string; price: number; qty: number }[];
  total: number;
  method: "Cash" | "MoMo" | "Card";
  time: string;
  customerType: string;
  date: string;
  waiter: string;
}

export interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  note: string;
}

// ---------- MENU ----------
let menuItems: MenuItem[] = [
  { id: 1, name: "Latte", price: 25, category: "Coffee", cost: 8 },
  { id: 2, name: "Cappuccino", price: 28, category: "Coffee", cost: 9 },
  { id: 3, name: "Espresso", price: 18, category: "Coffee", cost: 5 },
  { id: 4, name: "Jollof Rice", price: 35, category: "Food", cost: 15 },
  { id: 5, name: "Fried Rice", price: 38, category: "Food", cost: 16 },
  { id: 6, name: "Meat Pie", price: 15, category: "Food", cost: 7 },
  { id: 7, name: "Chocolate Cake", price: 22, category: "Desserts", cost: 10 },
  { id: 8, name: "Fresh Juice", price: 20, category: "Drinks", cost: 8 },
];

const menuListeners = new Set<() => void>();

export const getMenuItems = () => menuItems;
export const setMenuItems = (items: MenuItem[]) => {
  menuItems = items;
  menuListeners.forEach((fn) => fn());
};
export const subscribeMenu = (fn: () => void) => {
  menuListeners.add(fn);
  return () => { menuListeners.delete(fn); };
};

// ---------- STAFF ----------
let staffNames: string[] = ["Ama", "Kwame", "Yaw", "Abena", "Kofi"];

const staffListeners = new Set<() => void>();

export const getStaffNames = () => staffNames;
export const setStaffNames = (names: string[]) => {
  staffNames = names;
  staffListeners.forEach((fn) => fn());
};
export const subscribeStaff = (fn: () => void) => {
  staffListeners.add(fn);
  return () => { staffListeners.delete(fn); };
};

// ---------- SALES ----------
let sales: SaleDetail[] = [
  { id: "ORD-0041", items: [{ name: "Latte", price: 25, qty: 2 }, { name: "Jollof Rice", price: 35, qty: 1 }], total: 85.0, method: "MoMo", time: "2 min ago", customerType: "Walk-in", date: "27 Feb 2026, 10:32 AM", waiter: "Ama" },
  { id: "ORD-0040", items: [{ name: "Espresso", price: 18, qty: 1 }, { name: "Meat Pie", price: 15, qty: 1 }], total: 33.0, method: "Cash", time: "18 min ago", customerType: "Table", date: "27 Feb 2026, 10:14 AM", waiter: "Kwame" },
  { id: "ORD-0039", items: [{ name: "Cappuccino", price: 28, qty: 2 }, { name: "Fried Rice", price: 38, qty: 1 }, { name: "Chocolate Cake", price: 22, qty: 2 }], total: 138.0, method: "Card", time: "34 min ago", customerType: "Walk-in", date: "27 Feb 2026, 09:58 AM", waiter: "Ama" },
  { id: "ORD-0038", items: [{ name: "Latte", price: 25, qty: 1 }, { name: "Waakye", price: 30, qty: 1 }], total: 55.0, method: "MoMo", time: "1 hr ago", customerType: "Online", date: "27 Feb 2026, 09:30 AM", waiter: "Yaw" },
  { id: "ORD-0037", items: [{ name: "Cappuccino", price: 28, qty: 2 }, { name: "Meat Pie", price: 15, qty: 2 }, { name: "Espresso", price: 18, qty: 1 }], total: 104.0, method: "Cash", time: "1 hr ago", customerType: "Walk-in", date: "27 Feb 2026, 09:12 AM", waiter: "Kwame" },
];

const salesListeners = new Set<() => void>();

export const getSales = () => sales;
export const setSales = (s: SaleDetail[]) => {
  sales = s;
  salesListeners.forEach((fn) => fn());
};
export const subscribeSales = (fn: () => void) => {
  salesListeners.add(fn);
  return () => { salesListeners.delete(fn); };
};

// ---------- EXPENSES ----------
let expenses: Expense[] = [
  { id: 1, category: "Ingredients", amount: 450, date: "27 Feb 2026", note: "Weekly supply" },
  { id: 2, category: "Staff Wages", amount: 1200, date: "25 Feb 2026", note: "February wages" },
  { id: 3, category: "Electricity", amount: 180, date: "24 Feb 2026", note: "Monthly bill" },
  { id: 4, category: "Gas", amount: 95, date: "23 Feb 2026", note: "Cooking gas refill" },
  { id: 5, category: "Ingredients", amount: 320, date: "20 Feb 2026", note: "Coffee beans" },
];

const expenseListeners = new Set<() => void>();

export const getExpenses = () => expenses;
export const setExpenses = (e: Expense[]) => {
  expenses = e;
  expenseListeners.forEach((fn) => fn());
};
export const subscribeExpenses = (fn: () => void) => {
  expenseListeners.add(fn);
  return () => { expenseListeners.delete(fn); };
};

export const SHOP_NAME = "Purple Rain Coffee";
