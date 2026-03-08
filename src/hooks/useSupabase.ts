import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MenuItemRow = Tables<"menu_items">;
export type StaffRow = Tables<"staff">;
export type SaleRow = Tables<"sales">;
export type SaleItemRow = Tables<"sale_items">;
export type ExpenseRow = Tables<"expenses">;

export interface SaleWithItems extends SaleRow {
  items: SaleItemRow[];
}

// ---- Menu Items ----
export function useMenuItems() {
  const [items, setItems] = useState<MenuItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from("menu_items").select("*").order("created_at");
    if (data) setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("menu_items_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => {
        fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  const addItem = async (item: { name: string; price: number; category: string; cost: number }) => {
    const { data } = await supabase.from("menu_items").insert(item).select().single();
    if (data) setItems((prev) => [...prev, data]);
    return data;
  };

  const updateItem = async (id: string, updates: { name?: string; price?: number; category?: string; cost?: number }) => {
    const { data } = await supabase.from("menu_items").update(updates).eq("id", id).select().single();
    if (data) setItems((prev) => prev.map((i) => (i.id === id ? data : i)));
    return data;
  };

  const deleteItem = async (id: string) => {
    await supabase.from("menu_items").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return { items, loading, addItem, updateItem, deleteItem, refetch: fetch };
}

// ---- Staff ----
export function useStaff() {
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from("staff").select("*").order("created_at");
    if (data) setStaff(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("staff_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "staff" }, () => {
        fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  const addStaff = async (name: string) => {
    const { data } = await supabase.from("staff").insert({ name }).select().single();
    if (data) setStaff((prev) => [...prev, data]);
    return data;
  };

  const removeStaff = async (id: string) => {
    await supabase.from("staff").delete().eq("id", id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  return { staff, loading, addStaff, removeStaff, refetch: fetch };
}

// ---- Sales ----
export function useSales() {
  const [sales, setSales] = useState<SaleWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase
      .from("sales")
      .select("*, sale_items(*)")
      .order("created_at", { ascending: false });
    if (data) {
      setSales(
        data.map((s: any) => ({
          ...s,
          items: s.sale_items || [],
        }))
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("sales_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "sales" }, () => {
        fetch();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "sale_items" }, () => {
        fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  const addSale = async (sale: {
    order_id: string;
    total: number;
    method: string;
    customer_type: string;
    waiter: string;
    items: { name: string; price: number; qty: number }[];
  }) => {
    const { data: saleData } = await supabase
      .from("sales")
      .insert({
        order_id: sale.order_id,
        total: sale.total,
        method: sale.method,
        customer_type: sale.customer_type,
        waiter: sale.waiter,
      })
      .select()
      .single();

    if (saleData) {
      const saleItems = sale.items.map((i) => ({
        sale_id: saleData.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
      }));
      const { data: itemsData } = await supabase.from("sale_items").insert(saleItems).select();

      const newSale: SaleWithItems = { ...saleData, items: itemsData || [] };
      setSales((prev) => [newSale, ...prev]);
      return newSale;
    }
    return null;
  };

  return { sales, loading, addSale, refetch: fetch };
}

// ---- Expenses ----
export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    const { data } = await supabase.from("expenses").select("*").order("created_at", { ascending: false });
    if (data) setExpenses(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel("expenses_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "expenses" }, () => {
        fetch();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetch]);

  const addExpense = async (expense: { category: string; amount: number; note: string }) => {
    const { data } = await supabase.from("expenses").insert(expense).select().single();
    if (data) setExpenses((prev) => [data, ...prev]);
    return data;
  };

  const deleteExpense = async (id: string) => {
    await supabase.from("expenses").delete().eq("id", id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return { expenses, loading, addExpense, deleteExpense, refetch: fetch };
}

export const SHOP_NAME = "Purple Rain Coffee";
