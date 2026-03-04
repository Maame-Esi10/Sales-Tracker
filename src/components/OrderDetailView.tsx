import { ArrowLeft, Clock, Printer, Share2 } from "lucide-react";
import { SHOP_NAME } from "@/data/store";

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
        <div className="glass shadow-soft rounded-xl p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Customer</div>
          <div className="text-sm font-semibold mt-0.5">{customerType}</div>
        </div>
        <div className="glass shadow-soft rounded-xl p-3">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Payment</div>
          <div className="text-sm font-semibold mt-0.5">{method}</div>
        </div>
        {waiter && (
          <div className="glass shadow-soft rounded-xl p-3 col-span-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">Served by</div>
            <div className="text-sm font-semibold mt-0.5">{waiter}</div>
          </div>
        )}
      </div>

      <div className="px-4 mb-4">
        <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Items</h2>
        <div className="glass shadow-soft rounded-xl divide-y divide-border">
          {items.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-semibold">{item.name}</div>
                <div className="text-xs text-muted-foreground">₵{item.price.toFixed(2)} × {item.qty}</div>
              </div>
              <span className="text-sm font-bold text-accent">₵{(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-6">
        <div className="glass shadow-soft rounded-xl p-4 flex items-center justify-between">
          <span className="text-sm font-semibold uppercase tracking-wide">Total</span>
          <span className="text-2xl font-bold text-display">₵{total.toFixed(2)}</span>
        </div>
      </div>

      <div className="px-4 flex gap-2">
        <button onClick={onViewReceipt} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2">
          <Printer size={16} /> View Receipt
        </button>
        <button onClick={onViewReceipt} className="py-3 px-5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm flex items-center justify-center gap-2">
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default OrderDetailView;
