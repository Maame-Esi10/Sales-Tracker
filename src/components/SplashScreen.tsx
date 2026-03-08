import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/logo.png";
import { SHOP_NAME } from "@/hooks/useSupabase";

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 600);
    }, 2200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{
            background: "linear-gradient(145deg, hsl(270 60% 12%), hsl(270 45% 8%), hsl(280 40% 6%))",
          }}
        >
          {/* Rain drops */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 rounded-full"
              style={{
                height: 12 + Math.random() * 20,
                left: `${10 + Math.random() * 80}%`,
                background: `linear-gradient(to bottom, hsl(270 70% 65% / 0.6), hsl(270 70% 65% / 0))`,
              }}
              initial={{ top: "-5%", opacity: 0 }}
              animate={{ top: "105%", opacity: [0, 0.8, 0] }}
              transition={{
                duration: 1.2 + Math.random() * 0.8,
                delay: Math.random() * 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}

          <motion.img
            src={logo}
            alt="Purple Rain Coffee"
            className="w-28 h-28 rounded-3xl mb-6"
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 60px hsl(270 60% 40% / 0.4), 0 0 120px hsl(270 60% 30% / 0.2)",
            }}
          />

          <motion.h1
            className="text-3xl font-bold tracking-tight text-center"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, hsl(270 70% 75%), hsl(38 80% 65%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            {SHOP_NAME}
          </motion.h1>

          <motion.p
            className="text-sm mt-2 tracking-[0.3em] uppercase"
            style={{ color: "hsl(270 30% 55%)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            Brewed with passion
          </motion.p>

          <motion.div
            className="absolute bottom-16 w-12 h-1 rounded-full"
            style={{ background: "hsl(270 60% 50%)" }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: [0, 1, 0] }}
            transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SplashScreen;
