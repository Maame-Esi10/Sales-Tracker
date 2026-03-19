import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Coffee, ArrowLeft, Shield, User } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, type AppRole } from "@/hooks/useAuth";
import { SHOP_NAME } from "@/hooks/useSupabase";
import { toast } from "sonner";

type View = "login" | "signup" | "forgot";

const RAIN_DROPS = [
  { heightClass: "h-6", leftClass: "left-[12%]", duration: 1.7, delay: 0.2 },
  { heightClass: "h-7", leftClass: "left-[22%]", duration: 2.1, delay: 1.1 },
  { heightClass: "h-5", leftClass: "left-[34%]", duration: 1.9, delay: 0.6 },
  { heightClass: "h-8", leftClass: "left-[48%]", duration: 2.2, delay: 0.4 },
  { heightClass: "h-6", leftClass: "left-[57%]", duration: 1.8, delay: 1.6 },
  { heightClass: "h-7", leftClass: "left-[66%]", duration: 2.0, delay: 0.9 },
  { heightClass: "h-5", leftClass: "left-[78%]", duration: 2.3, delay: 1.3 },
  { heightClass: "h-8", leftClass: "left-[88%]", duration: 1.6, delay: 0.7 },
] as const;

const LoginPage = () => {
  const { user, loading: authLoading, signIn, signInWithGoogle, signUp, resetPassword } = useAuth();
  const [view, setView] = useState<View>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [selectedRole, setSelectedRole] = useState<AppRole>("staff");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Keep the animation stable to avoid layout shifts.
  const rainDrops = useMemo(() => RAIN_DROPS, []);

  // Hide scrollbars on the login page only.
  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  if (!authLoading && user) return <Navigate to="/" replace />;

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

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // On success, Supabase will redirect away from this page.
  };

  return (
    <div
      className="relative overflow-hidden min-h-screen flex flex-col items-center justify-center px-6 bg-[linear-gradient(165deg,hsl(270_60%_8%),hsl(270_45%_12%),hsl(280_35%_10%))]"
    >
      {/* Rain effect */}
      {rainDrops.map((drop, i) => (
        <motion.div
          key={i}
          className={`absolute top-0 w-0.5 rounded-full pointer-events-none ${drop.heightClass} ${drop.leftClass} bg-gradient-to-b from-[hsl(270_70%_65%_/_0.4)] to-transparent`}
          initial={{ top: "-5%", opacity: 0 }}
          animate={{ top: "105%", opacity: [0, 0.6, 0] }}
          transition={{
            duration: drop.duration,
            delay: drop.delay,
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
            className="w-20 h-20 rounded-2xl mb-4 shadow-[0_0_40px_hsl(270_60%_40%_/_0.3)]"
          />
          <h1
            className="text-2xl font-bold text-display bg-gradient-to-br from-[hsl(270_70%_75%)] to-[hsl(38_80%_65%)] bg-clip-text text-transparent"
          >
            {SHOP_NAME}
          </h1>
          <p className="text-xs mt-1 tracking-widest uppercase text-[hsl(270_30%_50%)]">
            {view === "login" ? "Staff Login" : view === "signup" ? "Create Account" : "Reset Password"}
          </p>
        </div>

        {/* Role Toggle - show on login and signup */}
        {view !== "forgot" && (
          <div className="flex rounded-xl overflow-hidden mb-5 border border-[hsl(270_30%_22%)]">
            <button
              onClick={() => setSelectedRole("staff")}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                selectedRole === "staff"
                  ? "bg-[hsl(270_50%_30%)] text-[hsl(270_70%_85%)]"
                  : "bg-[hsl(270_30%_14%)] text-[hsl(270_20%_45%)]"
              }`}
            >
              <User size={15} /> Staff
            </button>
            <button
              onClick={() => setSelectedRole("admin")}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                selectedRole === "admin"
                  ? "bg-[hsl(38_60%_30%)] text-[hsl(38_80%_75%)]"
                  : "bg-[hsl(270_30%_14%)] text-[hsl(270_20%_45%)]"
              }`}
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
          {view === "login" && (
            <>
              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 bg-white text-black flex items-center justify-center gap-2"
                aria-label="Continue with Google"
                title="Continue with Google"
              >
                Continue with Google
              </button>
              <div className="flex items-center gap-3 py-1">
                <div className="h-px flex-1 bg-[hsl(270_30%_22%)]" />
                <span className="text-[10px] tracking-wider uppercase text-[hsl(270_20%_55%)]">or</span>
                <div className="h-px flex-1 bg-[hsl(270_30%_22%)]" />
              </div>
            </>
          )}

          {view === "signup" && (
            <input
              type="text"
              placeholder="Display Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent/40 bg-[hsl(270_30%_16%)] text-[hsl(270_20%_85%)] border border-[hsl(270_30%_22%)]"
            />
          )}

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent/40 bg-[hsl(270_30%_16%)] text-[hsl(270_20%_85%)] border border-[hsl(270_30%_22%)]"
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
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all focus:ring-2 focus:ring-accent/40 pr-11 bg-[hsl(270_30%_16%)] text-[hsl(270_20%_85%)] border border-[hsl(270_30%_22%)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(270_30%_45%)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
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
              <button onClick={() => setView("forgot")} className="text-xs block w-full text-[hsl(270_40%_55%)]">
                Forgot password?
              </button>
              <p className="text-xs text-[hsl(270_20%_40%)]">
                Don't have an account?{" "}
                <button onClick={() => setView("signup")} className="font-semibold text-[hsl(270_60%_65%)]">
                  Sign Up
                </button>
              </p>
            </>
          )}
          {(view === "signup" || view === "forgot") && (
            <button onClick={() => setView("login")} className="text-xs flex items-center justify-center gap-1 w-full text-[hsl(270_40%_55%)]">
              <ArrowLeft size={12} /> Back to login
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
