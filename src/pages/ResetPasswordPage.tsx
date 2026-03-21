import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setReady(true);
    } else {
      toast.error("Invalid reset link");
      navigate("/login");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success("Password updated successfully");
      setTimeout(() => navigate("/"), 500);
    }
  };

  if (!ready) return null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "linear-gradient(165deg, hsl(270 60% 8%), hsl(270 45% 12%), hsl(280 35% 10%))" }}
    >
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="Logo" className="w-16 h-16 rounded-2xl mb-4" />
          <h1 className="text-xl font-bold" style={{ color: "hsl(270 20% 85%)" }}>Set New Password</h1>
        </div>
        <form onSubmit={handleReset} className="space-y-3">
          <input
            type="password"
            placeholder="New password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-accent/40"
            style={{ background: "hsl(270 30% 16%)", color: "hsl(270 20% 85%)", border: "1px solid hsl(270 30% 22%)" }}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-primary-foreground gradient-purple glow-purple disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
