"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, LogIn, CheckSquare } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setServerError("");
    setErrors({});
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setServerError("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)", width: "600px", height: "400px", background: "radial-gradient(ellipse, rgba(124,111,247,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div className="scale-in" style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <div style={{ width: "40px", height: "40px", background: "var(--accent)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckSquare size={22} color="white" />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: "28px", fontWeight: 700, color: "var(--text)" }}>Taski</span>
          </div>
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Sign in to manage your tasks</p>
        </div>

        <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>Welcome back</h2>

          {serverError && (
            <div style={{ background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: "20px", color: "var(--danger)", fontSize: "14px" }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>Email address</label>
              <input className={`input ${errors.email ? "error" : ""}`} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
              {errors.email && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{errors.email}</p>}
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className={`input ${errors.password ? "error" : ""}`} type={showPassword ? "text" : "password"}
                  placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  autoComplete="current-password" style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: "2px" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{errors.password}</p>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "44px" }} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><LogIn size={16} /> Sign In</span>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" style={{ color: "var(--accent-light)", textDecoration: "none", fontWeight: 500 }}>Create one</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}