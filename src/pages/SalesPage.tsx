import { useState } from "react";
import { Plus, Clock, CreditCard, Smartphone, Banknote, ArrowLeft, Minus, Printer, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ReceiptView from "@/components/ReceiptView";
import OrderDetailView from "@/components/OrderDetailView";
import PullToRefresh from "@/components/PullToRefresh";
import { useMenuItems, useSales, type SaleWithItems } from "@/hooks/useSupabase";
import { useAuth } from "@/hooks/useAuth";
import PeriodFilter from "@/components/PeriodFilter";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";

const filterByPeriod = (sales: SaleWithItems[], period: string, customDate?: Date): SaleWithItems[] => {
  if (period === "Custom" && customDate) {
    const dayStart = new Date(customDate.getFullYear(), customDate.getMonth(), customDate.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return sales.filter((sale) => {
      const d = new Date(sale.created_at);
      return d >= dayStart && d < dayEnd;
    });
  }
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return sales.filter((sale) => {
    if (period === "All Time") return true;
    const d = new Date(sale.created_at);
    if (period === "Today") return d >= startOfDay;
    if (period === "Week") return d >= startOfWeek;
    if (period === "Month") return d >= startOfMonth;
    return true;
  });
};

const formatTime = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 60000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
  });
};

const paymentIcon = (method: string) => {
  switch (method) {
    case "MoMo": return <Smartphone size={14} />;
    case "Card": return <CreditCard size={14} />;
    default: return <Banknote size={14} />;
  }
};

const SalesPage = () => {
  const { items: menuItems, refetch: refetchMenu } = useMenuItems();
  const { sales, addSale, refetch: refetchSales } = useSales();
  const { displayName } = useAuth();

  const { containerRef, pullDistance, refreshing } = usePullToRefresh({
    onRefresh: async () => { await Promise.all([refetchMenu(), refetchSales()]); },
  });

  const [showNewSale, setShowNewSale] = useState(false);
  const [customerType, setCustomerType] = useState("Walk-in");
  const [orderItems, setOrderItems] = useState<{ name: string; price: number; qty: number }[]>([]);
  const [receiptSale, setReceiptSale] = useState<SaleWithItems | null>(null);
  const [detailSale, setDetailSale] = useState<SaleWithItems | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "MoMo" | "Card">("Cash");
  const [period, setPeriod] = useState<string>("Today");
  const [customDate, setCustomDate] = useState<Date | undefined>();

  const getItemQty = (name: string) => orderItems.find((i) => i.name === name)?.qty || 0;

  const updateItem = (name: string, price: number, delta: number) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.name === name);
      if (!existing && delta > 0) return [...prev, { name, price, qty: 1 }];
      return prev.map((i) => i.name === name ? { ...i, qty: Math.max(0, i.qty + delta) } : i).filter((i) => i.qty > 0);
    });
  };

  const total = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleSaveSale = async () => {
    if (orderItems.length === 0) return;
    const newSale = await addSale({
      order_id: `ORD-${String(sales.length + 41).padStart(4, "0")}`,
      total,
      method: paymentMethod,
      customer_type: customerType,
      waiter: displayName,
      items: [...orderItems],
    });
    if (newSale) {
      setDetailSale(newSale);
    }
    setShowNewSale(false);
    setOrderItems([]);
  };

  if (receiptSale) {
    return (
      <ReceiptView
        orderId={receiptSale.order_id}
        items={receiptSale.items}
        total={receiptSale.total}
        method={receiptSale.method}
        customerType={receiptSale.customer_type}
        waiter={receiptSale.waiter || undefined}
        date={formatDate(receiptSale.created_at)}
        onClose={() => setReceiptSale(null)}
      />
    );
  }

  if (detailSale) {
    return (
      <OrderDetailView
        orderId={detailSale.order_id}
        items={detailSale.items}
        total={detailSale.total}
        method={detailSale.method}
        customerType={detailSale.customer_type}
        date={formatDate(detailSale.created_at)}
        time={formatTime(detailSale.created_at)}
        waiter={detailSale.waiter || undefined}
        onClose={() => setDetailSale(null)}
        onViewReceipt={() => setReceiptSale(detailSale)}
      />
    );
  }

  if (showNewSale) {
    return (
      <div className="min-h-screen pb-44">
        <div className="flex items-center gap-3 px-4 pt-6 pb-2">
          <button onClick={() => { setShowNewSale(false); setOrderItems([]); }} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-display">New Sale</h1>
        </div>

        {/* Logged-in staff indicator */}
        {displayName && (
          <div className="px-4 mb-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Serving as</div>
            <div className="px-4 py-2 rounded-xl bg-accent text-accent-foreground text-sm font-semibold inline-block">{displayName}</div>
          </div>
        )}

        {/* Customer type */}
        <div className="px-4 mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Customer Type</label>
          <div className="flex gap-2">
            {(["Walk-in", "Table", "Online"] as const).map((t) => (
              <button key={t} onClick={() => setCustomerType(t)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${customerType === t ? "gradient-purple text-primary-foreground shadow-sm" : "bg-secondary text-secondary-foreground"}`}>{t}</button>
            ))}
          </div>
        </div>

        {/* Menu items - grouped by category */}
        <div className="px-4 mb-4">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Add Items</label>
          {Object.entries(
            menuItems.reduce((acc, item) => {
              const cat = item.category || "Other";
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(item);
              return acc;
            }, {} as Record<string, typeof menuItems>)
          ).map(([category, items]) => (
            <div key={category} className="mb-3">
              <h3 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{category}</h3>
              <div className="grid grid-cols-2 gap-2">
                {items.map((item) => {
                  const qty = getItemQty(item.name);
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      className={`glass shadow-soft rounded-xl p-3 flex flex-col justify-between transition-all ${qty > 0 ? "ring-1 ring-accent/40" : ""}`}
                    >
                      <div className="mb-2">
                        <div className="text-sm font-semibold leading-tight">{item.name}</div>
                        <div className="text-xs text-accent font-medium mt-0.5">₵{Number(item.price).toFixed(2)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        {qty > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => updateItem(item.name, Number(item.price), -1)} className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
                              <Minus size={12} />
                            </button>
                            <span className="text-sm font-bold w-5 text-center">{qty}</span>
                            <button onClick={() => updateItem(item.name, Number(item.price), 1)} className="w-7 h-7 rounded-lg bg-accent text-accent-foreground flex items-center justify-center">
                              <Plus size={12} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => updateItem(item.name, Number(item.price), 1)} className="w-full py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-accent hover:text-accent-foreground transition-colors flex items-center justify-center gap-1">
                            <Plus size={12} /> Add
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <AnimatePresence>
          {orderItems.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="px-4 mb-4 overflow-hidden">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">Order Summary</label>
              <div className="glass shadow-soft rounded-xl divide-y divide-border">
                {orderItems.map((item) => (
                  <div key={item.name} className="flex items-center justify-between p-3">
                    <div className="text-sm font-medium">
                      <span className="text-muted-foreground">{item.qty}×</span> {item.name}
                    </div>
                    <span className="text-sm font-semibold text-accent">₵{(item.price * item.qty).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fixed bottom checkout */}
        <div className="fixed bottom-0 left-0 right-0 px-4 pb-4 pt-2 border-t border-border/30 z-[55]" style={{ background: "hsl(var(--background) / 0.92)", backdropFilter: "blur(20px)" }}>
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Total ({orderItems.reduce((s, i) => s + i.qty, 0)} items)</span>
              <span className="text-2xl font-bold text-display">₵{total.toFixed(2)}</span>
            </div>
            <div className="mb-3 flex gap-2">
              {(["Cash", "MoMo", "Card"] as const).map((m) => (
                <button key={m} onClick={() => setPaymentMethod(m)} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${paymentMethod === m ? "bg-accent text-accent-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {m}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveSale} disabled={orderItems.length === 0} className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 text-primary-foreground gradient-purple glow-purple">
                <Check size={16} /> Checkout
              </button>
              <button className="py-3 px-3 rounded-xl bg-secondary text-secondary-foreground text-sm">
                <Printer size={16} />
              </button>
              <button onClick={() => { setShowNewSale(false); setOrderItems([]); }} className="py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filtered = filterByPeriod(sales, period, customDate);
  const periodTotal = filtered.reduce((s, sale) => s + Number(sale.total), 0);

    <PullToRefresh containerRef={containerRef} pullDistance={pullDistance} refreshing={refreshing}>
      <div className="pb-24">
      <PageHeader
        title="Sales"
        action={
          <button onClick={() => setShowNewSale(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] text-primary-foreground gradient-purple glow-purple">
            <Plus size={16} /> New Sale
          </button>
        }
      />

      <div className="px-4 mb-3">
        <PeriodFilter period={period} onPeriodChange={setPeriod} customDate={customDate} onCustomDateChange={setCustomDate} />
      </div>

      <div className="px-4 mb-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5 flex items-center justify-between text-primary-foreground"
          style={{
            background: "linear-gradient(135deg, hsl(270 45% 25%), hsl(270 55% 35%), hsl(270 50% 30%))",
            boxShadow: "0 8px 30px hsl(270 50% 25% / 0.3)",
          }}
        >
          <div>
            <div className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">{period} Sales</div>
            <div className="text-3xl font-bold mt-1" style={{ fontFamily: "'Playfair Display', serif" }}>₵{periodTotal.toFixed(2)}</div>
          </div>
          <div className="flex flex-col items-end">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "hsl(0 0% 100% / 0.15)" }}>
              <span className="text-xl">☕</span>
            </div>
            <div className="text-xs text-primary-foreground/70 mt-1">{filtered.length} orders</div>
          </div>
        </motion.div>
      </div>

      <div className="px-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Recent Orders</h2>
        <div className="space-y-2">
          {filtered.map((sale, i) => (
            <motion.button
              key={sale.id}
              onClick={() => setDetailSale(sale)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="w-full glass shadow-soft rounded-xl p-4 flex items-center justify-between text-left hover:shadow-card transition-shadow"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold">{sale.order_id}</span>
                  <span className="px-2 py-0.5 rounded-lg bg-secondary text-[10px] font-medium text-secondary-foreground flex items-center gap-1">
                    {paymentIcon(sale.method)} {sale.method}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{sale.items.length} items</span>
                  <span>·</span>
                  <span className="flex items-center gap-0.5"><Clock size={10} />{formatTime(sale.created_at)}</span>
                  {sale.waiter && <><span>·</span><span>{sale.waiter}</span></>}
                </div>
              </div>
              <span className="text-base font-bold text-accent">₵{Number(sale.total).toFixed(2)}</span>
            </motion.button>
          ))}
          {filtered.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No sales for this period</p>
          )}
        </div>
      </div>
    </PullToRefresh>
  );
};

export default SalesPage;
