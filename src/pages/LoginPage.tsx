import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Coffee, ArrowLeft, Shield, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { SHOP_NAME } from "@/hooks/useSupabase";
import { toast } from "sonner";

type View = "login" | "signup" | "forgot";

const LoginPage = () => {
  const { signIn, signUp, resetPassword } = useAuth();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) toast.error(error.message);
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password, displayName, selectedRole);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Check your email to confirm your account");
      setView("login");
    }
    setLoading(false);
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent to your email");
      setView("login");
    }
    setLoading(false);
  };

  const inputStyle = {
    background: "hsl(270 30% 16%)",
    color: "hsl(270 20% 85%)",
    border: "1px solid hsl(270 30% 22%)",
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{
        background: "linear-gradient(165deg, hsl(270 60% 8%), hsl(270 45% 12%), hsl(280 35% 10%))",
      }}
    >
      {/* Rain effect */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 rounded-full"
          style={{
            height: 10 + Math.random() * 16,
            left: `${10 + Math.random() * 80}%`,
            background: "linear-gradient(to bottom, hsl(270 70% 65% / 0.4), transparent)",
          }}
          initial={{ top: "-5%", opacity: 0 }}
          animate={{ top: "105%", opacity: [0, 0.6, 0] }}
          transition={{
            duration: 1.5 + Math.random(),
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt={SHOP_NAME}
            className="w-20 h-20 rounded-2xl mb-4"
            style={{ boxShadow: "0 0 40px hsl(270 60% 40% / 0.3)" }}
          />
          <h1
            className="text-2xl font-bold"
            style={{
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, hsl(270 70% 75%), hsl(38 80% 65%))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {SHOP_NAME}
          </h1>
          <p className="text-xs mt-1 tracking-widest uppercase" style={{ color: "hsl(270 30% 50%)" }}>
            {view === "login" ? "Staff Login" : view === "signup" ? "Create Account" : "Reset Password"}
          </p>
        </div>

        {/* Role Toggle - show on login and signup */}
        {view !== "forgot" && (
          <div className="flex rounded-xl overflow-hidden mb-5" style={{ border: "1px solid hsl(270 30% 22%)" }}>
            <button
              onClick={() => setSelectedRole("staff")}
              className="flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={{
                background: selectedRole === "staff" ? "hsl(270 50% 30%)" : "hsl(270 30% 14%)",
                color: selectedRole === "staff" ? "hsl(270 70% 85%)" : "hsl(270 20% 45%)",
              }}
            >
              <User size={15} /> Staff
            </button>
            <button
              onClick={() => setSelectedRole("admin")}
              className="flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all"
              style={{
                background: selectedRole === "admin" ? "hsl(38 60% 30%)" : "hsl(270 30% 14%)",
                color: selectedRole === "admin" ? "hsl(38 80% 75%)" : "hsl(270 20% 45%)",
              }}
            >
              <Shield size={15} /> Owner
            </button>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={view === "login" ? handleLogin : view === "signup" ? handleSignup : handleForgot}
          className="space-y-3"
        >
          {view === "signup" && (
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent/40"
              style={inputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent/40"
            style={inputStyle}
          />

          {view !== "forgot" && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent/40 pr-11"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                style={{ color: "hsl(270 30% 45%)" }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 text-primary-foreground gradient-purple glow-purple flex items-center justify-center gap-2"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Coffee size={16} />
              </motion.div>
            ) : (
              view === "login" ? "Sign In" : view === "signup" ? "Create Account" : "Send Reset Link"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="mt-5 text-center space-y-2">
          {view === "login" && (
            <>
              <button onClick={() => setView("forgot")} className="text-xs block w-full" style={{ color: "hsl(270 40% 55%)" }}>
                Forgot password?
              </button>
              <p className="text-xs" style={{ color: "hsl(270 20% 40%)" }}>
                Don't have an account?{" "}
                <button onClick={() => setView("signup")} className="font-semibold" style={{ color: "hsl(270 60% 65%)" }}>
                  Sign Up
                </button>
              </p>
            </>
          )}
          {(view === "signup" || view === "forgot") && (
            <button onClick={() => setView("login")} className="text-xs flex items-center justify-center gap-1 w-full" style={{ color: "hsl(270 40% 55%)" }}>
              <ArrowLeft size={12} /> Back to login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
