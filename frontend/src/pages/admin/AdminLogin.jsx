import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { EASE } from "@/components/site/Reveal";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const formatError = (detail) => {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((e) => e?.msg || JSON.stringify(e)).join(" ");
  return String(detail);
};

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API}/admin/login`, { email, password });
      localStorage.setItem("ory_admin_token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(formatError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3.5 text-sm text-white placeholder:text-white/35 outline-none transition-colors duration-300 focus:border-brand-orange";

  return (
    <main data-testid="admin-login-page" className="flex min-h-screen items-center justify-center bg-brand-ink bg-grid-dark px-6 text-white">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl glow-blue"
      >
        <Link to="/" className="font-display text-xl font-extrabold tracking-tight">
          ORYNTIC<span className="text-brand-orange">LABS</span>
        </Link>
        <div className="mt-8 flex items-center gap-3">
          <Lock className="h-5 w-5 text-brand-orange" strokeWidth={1.75} />
          <h1 className="font-display text-2xl font-bold tracking-tight">Admin Access</h1>
        </div>
        <p className="mt-2 text-sm text-white/45">Sign in to manage site content.</p>

        <form onSubmit={submit} className="mt-8 space-y-4" data-testid="admin-login-form">
          <input type="email" required placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} data-testid="admin-email-input" className={inputCls} />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} data-testid="admin-password-input" className={inputCls} />
          {error && <p className="text-sm text-red-400" data-testid="admin-login-error">{error}</p>}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-orange px-8 py-4 text-sm font-bold text-white transition-colors duration-300 hover:bg-[#e04a00] disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Signing in..." : "Sign in"}
          </motion.button>
        </form>
      </motion.div>
    </main>
  );
}
