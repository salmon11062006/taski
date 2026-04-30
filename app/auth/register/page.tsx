"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, CheckSquare } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required.";
    if (!form.email) e.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Enter a valid email.";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 6) e.password = "Password must be at least 6 characters.";
    if (!form.confirm) e.confirm = "Please confirm your password.";
    else if (form.confirm !== form.password) e.confirm = "Passwords do not match.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setServerError("");
    setErrors({});

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setServerError(data.error || "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (result?.error) router.push("/auth/login");
    else { router.push("/dashboard"); router.refresh(); }
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
          <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Create your free account</p>
        </div>

        <div className="glass" style={{ padding: "32px", borderRadius: "var(--radius-lg)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>Create account</h2>

          {serverError && (
            <div style={{ background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "var(--radius-sm)", padding: "12px 14px", marginBottom: "20px", color: "var(--danger)", fontSize: "14px" }}>
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Name */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>Full name</label>
              <input className={`input ${errors.name ? "error" : ""}`} type="text" placeholder="Jane Doe"
                value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} autoComplete="name" />
              {errors.name && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{errors.name}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>Email address</label>
              <input className={`input ${errors.email ? "error" : ""}`} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} autoComplete="email" />
              {errors.email && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <input className={`input ${errors.password ? "error" : ""}`} type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 characters" value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="new-password" style={{ paddingRight: "44px" }} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-subtle)", padding: "2px" }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{errors.password}</p>}
            </div>

            {/* Confirm */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>Confirm password</label>
              <input className={`input ${errors.confirm ? "error" : ""}`} type={showPassword ? "text" : "password"}
                placeholder="Repeat password" value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} autoComplete="new-password" />
              {errors.confirm && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{errors.confirm}</p>}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", height: "44px" }} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}><UserPlus size={16} /> Create Account</span>
              )}
            </button>
          </form>

          <p style={{ textAlign: "center", marginTop: "24px", fontSize: "14px", color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" style={{ color: "var(--accent-light)", textDecoration: "none", fontWeight: 500 }}>Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}