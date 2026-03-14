import { RefObject } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface PullToRefreshProps {
  containerRef: RefObject<HTMLDivElement>;
  pullDistance: number;
  refreshing: boolean;
  children: React.ReactNode;
}

const PullToRefresh = ({ containerRef, pullDistance, refreshing, children }: PullToRefreshProps) => {
  const showIndicator = pullDistance > 10 || refreshing;
  const progress = Math.min(pullDistance / 80, 1);

  return (
    <div ref={containerRef} className="min-h-screen overflow-y-auto">
      {showIndicator && (
        <div className="flex justify-center" style={{ height: pullDistance }}>
          <motion.div
            className="flex items-center justify-center"
            animate={refreshing ? { rotate: 360 } : { rotate: progress * 180 }}
            transition={refreshing ? { repeat: Infinity, duration: 0.8, ease: "linear" } : { duration: 0 }}
          >
            <RefreshCw
              size={20}
              className="text-accent"
              style={{ opacity: Math.max(0.3, progress) }}
            />
          </motion.div>
        </div>
      )}
      {children}
    </div>
  );
};

export default PullToRefresh;
