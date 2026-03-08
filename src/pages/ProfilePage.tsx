import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, User, Shield, Mail, Key, ChevronRight, Check, X, Phone } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user, role, isAdmin, signOut, resetPassword } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [editingName, setEditingName] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) setDisplayName(data.display_name);
        });
    }
  }, [user]);

  const handleUpdateName = async () => {
    if (!user || !displayName.trim()) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName.trim() })
      .eq("id", user.id);
    if (error) {
      toast.error("Failed to update name");
    } else {
      toast.success("Name updated");
      setEditingName(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail.trim()) return;
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Confirmation sent to your new email");
      setEditingEmail(false);
      setNewEmail("");
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setChangingPassword(true);
    const { error } = await resetPassword(user.email);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Password reset link sent to your email");
    }
    setChangingPassword(false);
  };

  return (
    <div className="min-h-screen pb-24">
      <PageHeader title="Profile" showBrand={false} />

      <div className="px-4 space-y-4">
        {/* Avatar & Name */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass shadow-soft rounded-2xl p-6 flex flex-col items-center"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mb-3"
            style={{ background: "linear-gradient(135deg, hsl(270 50% 35%), hsl(270 60% 50%))" }}
          >
            <User size={32} className="text-primary-foreground" />
          </div>

          {editingName ? (
            <div className="flex gap-2 w-full max-w-xs">
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-ring/30"
                onKeyDown={(e) => e.key === "Enter" && handleUpdateName()}
              />
              <button onClick={handleUpdateName} className="px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground gradient-purple">
                Save
              </button>
            </div>
          ) : (
            <button onClick={() => setEditingName(true)} className="text-lg font-bold text-display hover:text-accent transition-colors">
              {displayName || "Unnamed"}
            </button>
          )}

          <div className="flex items-center gap-1.5 mt-2">
            <Shield size={12} className={isAdmin ? "text-warning" : "text-accent"} />
            <span className="text-xs font-medium text-muted-foreground capitalize">
              {role === "admin" ? "Owner / Admin" : "Staff"}
            </span>
          </div>
        </motion.div>

        {/* Email */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass shadow-soft rounded-2xl divide-y divide-border"
        >
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground" />
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Email</div>
                <div className="text-sm font-medium">{user?.email}</div>
              </div>
              {!editingEmail ? (
                <button
                  onClick={() => { setEditingEmail(true); setNewEmail(user?.email || ""); }}
                  className="text-xs text-accent font-medium"
                >
                  Change
                </button>
              ) : (
                <button onClick={() => setEditingEmail(false)}>
                  <X size={16} className="text-muted-foreground" />
                </button>
              )}
            </div>
            {editingEmail && (
              <div className="flex gap-2 mt-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="New email address"
                  className="flex-1 px-3 py-2 rounded-xl bg-secondary text-sm outline-none focus:ring-2 focus:ring-ring/30"
                  onKeyDown={(e) => e.key === "Enter" && handleUpdateEmail()}
                />
                <button onClick={handleUpdateEmail} className="px-4 py-2 rounded-xl text-sm font-medium text-primary-foreground gradient-purple flex items-center gap-1">
                  <Check size={14} /> Save
                </button>
              </div>
            )}
          </div>

          {/* Password */}
          <button
            onClick={handleResetPassword}
            disabled={changingPassword}
            className="w-full p-4 flex items-center gap-3 hover:bg-secondary/50 transition-colors"
          >
            <Key size={16} className="text-muted-foreground" />
            <div className="flex-1 text-left">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Password</div>
              <div className="text-sm font-medium">{changingPassword ? "Sending reset link..." : "Send reset link to email"}</div>
            </div>
            <ChevronRight size={14} className="text-muted-foreground" />
          </button>

          {/* Role */}
          <div className="p-4 flex items-center gap-3">
            <Shield size={16} className="text-muted-foreground" />
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">Role</div>
              <div className="text-sm font-medium capitalize">{role === "admin" ? "Owner (Admin)" : "Staff"}</div>
            </div>
          </div>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="glass shadow-soft rounded-2xl p-4"
        >
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium mb-3">Company Contact</div>
          <div className="flex items-center gap-3">
            <Mail size={16} className="text-accent" />
            <a href="mailto:purpleraincoffee@gmail.com" className="text-sm font-medium text-accent hover:underline">
              purpleraincoffee@gmail.com
            </a>
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => signOut()}
          className="w-full glass shadow-soft rounded-2xl p-4 flex items-center gap-3 text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={18} />
          <span className="text-sm font-semibold">Sign Out</span>
        </motion.button>
      </div>
    </div>
  );
};

export default ProfilePage;
