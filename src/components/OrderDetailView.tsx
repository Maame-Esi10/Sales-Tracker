import { ArrowLeft, Clock, Printer, Share2, Check } from "lucide-react";
import { SHOP_NAME } from "@/hooks/useSupabase";
import { motion } from "framer-motion";

interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

interface OrderDetailViewProps {
  orderId: string;
  items: OrderItem[];
  total: number;
  method: string;
  customerType: string;
  date: string;
  time: string;
  waiter?: string;
  onClose: () => void;
  onViewReceipt: () => void;
}

const OrderDetailView = ({ orderId, items, total, method, customerType, date, time, waiter, onClose, onViewReceipt }: OrderDetailViewProps) => {
  return (
    <div className="min-h-screen pb-24">
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button onClick={onClose} className="p-2 -ml-2 rounded-xl hover:bg-secondary transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-display">{orderId}</h1>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            <Clock size={10} /> {time} · {date}
          </p>
        </div>
      </div>

      <div className="px-4 mb-1">
        <p className="text-xs text-muted-foreground">{SHOP_NAME}</p>
      </div>

      <div className="px-4 mb-4 grid grid-cols-2 gap-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass shadow-soft rounded-xl p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Customer</div>
          <div className="text-sm font-semibold mt-0.5">{customerType}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass shadow-soft rounded-xl p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Payment</div>
          <div className="text-sm font-semibold mt-0.5">{method}</div>
        </motion.div>
        {waiter && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass shadow-soft rounded-xl p-3 col-span-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Served by</div>
            <div className="text-sm font-semibold mt-0.5">{waiter}</div>
          </motion.div>
        )}
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Items</h2>
        <div className="glass shadow-soft rounded-xl divide-y divide-border">
          {items.map((item, i) => (
            <motion.div key={item.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.05 }} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs text-muted-foreground">₵{Number(item.price).toFixed(2)} × {item.qty}</div>
              </div>
              <span className="text-sm font-bold text-accent">₵{(Number(item.price) * item.qty).toFixed(2)}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="rounded-xl p-4 flex items-center justify-between" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}>
          <span className="text-sm font-semibold uppercase tracking-wide text-primary-foreground">Total</span>
          <span className="text-2xl font-bold text-primary-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>₵{Number(total).toFixed(2)}</span>
        </motion.div>
      </div>

      <div className="px-4 flex gap-2">
        <button onClick={onViewReceipt} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]">
          <Printer size={16} /> View Receipt
        </button>
        <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-accent text-accent-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]">
          <Check size={16} /> Done
        </button>
        <button onClick={onViewReceipt} className="py-3 px-4 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default OrderDetailView;
