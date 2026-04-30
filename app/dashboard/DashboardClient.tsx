"use client";
import { useState, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import {
  Plus, LogOut, CheckSquare, Trash2, Pencil, X, Check,
  Calendar, Flag, Search, Filter, ChevronDown, AlertCircle,
  ClipboardList, Star
} from "lucide-react";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface User { id: string; name: string; email: string; }

const PRIORITY_LABELS = { high: "High", medium: "Medium", low: "Low" };
const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function formatDate(d?: string) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isOverdue(dueDate?: string, completed?: boolean) {
  if (!dueDate || completed) return false;
  return new Date(dueDate) < new Date();
}

function TodoModal({ mode, initial, onClose, onSave }: {
  mode: "add" | "edit"; initial?: Partial<Todo>;
  onClose: () => void; onSave: (data: Partial<Todo>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    title: initial?.title || "", description: initial?.description || "",
    priority: initial?.priority || "medium",
    dueDate: initial?.dueDate ? initial.dueDate.slice(0, 10) : "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  function validate() {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (form.title.trim().length > 200) e.title = "Title must be 200 chars or less.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true); setApiError("");
    try { await onSave({ ...form, dueDate: form.dueDate || undefined }); onClose(); }
    catch (err: unknown) { setApiError(err instanceof Error ? err.message : "An error occurred."); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="scale-in glass" style={{ width: "100%", maxWidth: "480px", borderRadius: "var(--radius-lg)", padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
          <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: 700 }}>{mode === "add" ? "New Task" : "Edit Task"}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={16} /></button>
        </div>
        {apiError && (
          <div style={{ background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginBottom: "16px", color: "var(--danger)", fontSize: "14px", display: "flex", gap: "8px", alignItems: "center" }}>
            <AlertCircle size={14} /> {apiError}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>Task title *</label>
            <input className={`input ${errors.title ? "error" : ""}`} placeholder="What needs to be done?" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            {errors.title && <p style={{ color: "var(--danger)", fontSize: "12px", marginTop: "4px" }}>{errors.title}</p>}
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>Description (optional)</label>
            <textarea className="input" placeholder="Add more details..." value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: "vertical", minHeight: "80px", lineHeight: "1.5" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>
                <Flag size={12} style={{ display: "inline", marginRight: "4px" }} />Priority
              </label>
              <select className="input" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value as Todo["priority"] }))} style={{ cursor: "pointer" }}>
                <option value="high">🔴 High</option>
                <option value="medium">🟡 Medium</option>
                <option value="low">🔵 Low</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "var(--text-muted)", marginBottom: "6px" }}>
                <Calendar size={12} style={{ display: "inline", marginRight: "4px" }} />Due date
              </label>
              <input className="input" type="date" value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} style={{ colorScheme: "dark", cursor: "pointer" }} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : mode === "add" ? "Create Task" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteConfirm({ title, onConfirm, onCancel, loading }: { title: string; onConfirm: () => void; onCancel: () => void; loading: boolean; }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div className="scale-in glass" style={{ width: "100%", maxWidth: "380px", borderRadius: "var(--radius-lg)", padding: "28px", textAlign: "center" }}>
        <div style={{ width: "48px", height: "48px", background: "var(--danger-dim)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <Trash2 size={20} color="var(--danger)" />
        </div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Delete Task?</h3>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "24px" }}>
          &ldquo;<strong style={{ color: "var(--text)" }}>{title}</strong>&rdquo; will be permanently deleted.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>{loading ? "Deleting..." : "Delete"}</button>
        </div>
      </div>
    </div>
  );
}

function TodoItem({ todo, onToggle, onEdit, onDelete }: { todo: Todo; onToggle: () => void; onEdit: () => void; onDelete: () => void; }) {
  const overdue = isOverdue(todo.dueDate, todo.completed);
  return (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "14px", 
      padding: "12px 18px", 
      background: "var(--surface-2)", 
      borderRadius: "var(--radius)", 
      border: "1px solid var(--border)",
      width: "100%", // Explicitly set width to 100%[cite: 1]
      boxSizing: "border-box" // Prevents padding from breaking the width[cite: 1]
    }}>
      {/* Checkbox */}
      <input type="checkbox" className="todo-checkbox" checked={todo.completed} onChange={onToggle} style={{ flexShrink: 0 }} />
      
      {/* Middle Section: Title and Priority */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <span style={{ 
          fontSize: "15px", 
          fontWeight: 500, 
          color: "var(--text)", 
          textDecoration: todo.completed ? "line-through" : "none",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis"
        }}>
          {todo.title}
        </span>
        <span className={`priority-${todo.priority}`} style={{ 
          fontSize: "10px", 
          fontWeight: 700, 
          padding: "2px 8px", 
          borderRadius: "99px",
          flexShrink: 0 // Prevents the tag from squishing[cite: 1]
        }}>
          {PRIORITY_LABELS[todo.priority]}
        </span>
      </div>

      {/* Right Section: Buttons */}
      <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
        <button className="btn btn-ghost btn-icon btn-sm" onClick={onEdit}><Pencil size={14} /></button>
        <button className="btn btn-danger btn-icon btn-sm" onClick={onDelete}><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

export function DashboardClient({ user }: { user: User }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modal, setModal] = useState<{ mode: "add" | "edit"; todo?: Todo } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Todo | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
  const [filterPriority, setFilterPriority] = useState<"all" | "high" | "medium" | "low">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "dueDate">("newest");
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg: string) { setToastMsg(msg); setTimeout(() => setToastMsg(""), 3000); }

  const fetchTodos = useCallback(async () => {
    setLoading(true); setLoadError("");
    try {
      const res = await fetch("/api/todos");
      if (!res.ok) throw new Error("Failed to load tasks.");
      setTodos(await res.json());
    } catch { setLoadError("Could not load your tasks. Please refresh."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  async function handleSave(data: Partial<Todo>) {
    if (modal?.mode === "add") {
      const res = await fetch("/api/todos", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create task.");
      setTodos(t => [json, ...t]); showToast("Task created!");
    } else if (modal?.todo) {
      const res = await fetch(`/api/todos/${modal.todo.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update task.");
      setTodos(t => t.map(td => td.id === json.id ? json : td)); showToast("Task updated!");
    }
  }

  async function handleToggle(todo: Todo) {
    const res = await fetch(`/api/todos/${todo.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ completed: !todo.completed }) });
    if (res.ok) { const json = await res.json(); setTodos(t => t.map(td => td.id === json.id ? json : td)); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const res = await fetch(`/api/todos/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) { setTodos(t => t.filter(td => td.id !== deleteTarget.id)); showToast("Task deleted."); }
    setDeleteLoading(false); setDeleteTarget(null);
  }

  const filtered = todos.filter(t => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase()) && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus === "active" && t.completed) return false;
    if (filterStatus === "completed" && !t.completed) return false;
    if (filterPriority !== "all" && t.priority !== filterPriority) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "priority") return PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (sortBy === "dueDate") { if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(); }
    return 0;
  });

  const stats = { total: todos.length, completed: todos.filter(t => t.completed).length, active: todos.filter(t => !t.completed).length, overdue: todos.filter(t => isOverdue(t.dueDate, t.completed)).length };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="glass" style={{ position: "sticky", top: 0, zIndex: 40, borderBottom: "1px solid var(--border)", borderRadius: 0 }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 24px", height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", background: "var(--accent)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CheckSquare size={18} color="white" />
            </div>
            <span style={{ fontFamily: "Syne, sans-serif", fontSize: "20px", fontWeight: 700 }}>Taski</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Hi, <strong style={{ color: "var(--text)" }}>{user.name.split(" ")[0]}</strong></span>
            <button className="btn btn-ghost btn-sm" onClick={() => signOut({ callbackUrl: "/auth/login" })} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <LogOut size={14} /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, maxWidth: "900px", margin: "0 auto", width: "100%", padding: "32px 24px" }}>
        <div style={{ marginBottom: "28px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "32px", fontWeight: 800, marginBottom: "4px" }}>My Tasks</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>{stats.active} active · {stats.completed} completed{stats.overdue > 0 ? ` · ${stats.overdue} overdue` : ""}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ mode: "add" })} style={{ display: "flex", alignItems: "center", gap: "8px", height: "44px", paddingInline: "20px" }}>
            <Plus size={18} /> New Task
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "24px" }}>
          {[
            { label: "Total", value: stats.total, icon: <ClipboardList size={16} />, color: "var(--accent)" },
            { label: "Active", value: stats.active, icon: <Star size={16} />, color: "var(--warning)" },
            { label: "Completed", value: stats.completed, icon: <Check size={16} />, color: "var(--success)" },
            { label: "Overdue", value: stats.overdue, icon: <AlertCircle size={16} />, color: "var(--danger)" },
          ].map(s => (
            <div key={s.label} style={{ background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: s.color, marginBottom: "6px" }}>{s.icon}<span style={{ fontSize: "12px", fontWeight: 500 }}>{s.label}</span></div>
              <div style={{ fontFamily: "Syne, sans-serif", fontSize: "26px", fontWeight: 700, color: "var(--text)" }}>{s.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: "160px" }}>
            <Search size={14} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
            <input className="input" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "36px" }} />
          </div>
          <div style={{ position: "relative" }}>
            <Filter size={12} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)" }} />
            <ChevronDown size={12} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value as typeof filterStatus)} style={{ paddingLeft: "28px", paddingRight: "28px", cursor: "pointer", minWidth: "120px" }}>
              <option value="all">All Status</option><option value="active">Active</option><option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ position: "relative" }}>
            <ChevronDown size={12} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <select className="input" value={filterPriority} onChange={e => setFilterPriority(e.target.value as typeof filterPriority)} style={{ paddingRight: "28px", cursor: "pointer", minWidth: "130px" }}>
              <option value="all">All Priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
            </select>
          </div>
          <div style={{ position: "relative" }}>
            <ChevronDown size={12} style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--text-subtle)", pointerEvents: "none" }} />
            <select className="input" value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)} style={{ paddingRight: "28px", cursor: "pointer", minWidth: "130px" }}>
              <option value="newest">Newest First</option><option value="oldest">Oldest First</option><option value="priority">By Priority</option><option value="dueDate">By Due Date</option>
            </select>
          </div>
        </div>

        {loadError && (
          <div style={{ background: "var(--danger-dim)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "var(--radius)", padding: "14px 18px", marginBottom: "20px", color: "var(--danger)", display: "flex", gap: "10px", alignItems: "center" }}>
            <AlertCircle size={16} /> {loadError}
            <button className="btn btn-sm" style={{ marginLeft: "auto", color: "var(--danger)", border: "1px solid rgba(248,113,113,0.3)", background: "transparent" }} onClick={fetchTodos}>Retry</button>
          </div>
        )}

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: "76px" }} />)}</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 24px", color: "var(--text-muted)" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>{search || filterStatus !== "all" || filterPriority !== "all" ? "🔍" : "✅"}</div>
            <p style={{ fontFamily: "Syne, sans-serif", fontSize: "18px", fontWeight: 600, color: "var(--text)", marginBottom: "6px" }}>
              {search || filterStatus !== "all" || filterPriority !== "all" ? "No tasks match your filters" : "No tasks yet!"}
            </p>
            <p style={{ fontSize: "14px" }}>{search || filterStatus !== "all" || filterPriority !== "all" ? "Try adjusting your search or filters." : "Create your first task to get started."}</p>
            {!(search || filterStatus !== "all" || filterPriority !== "all") && (
              <button className="btn btn-primary" style={{ marginTop: "20px" }} onClick={() => setModal({ mode: "add" })}><Plus size={16} /> Create a Task</button>
            )}
          </div>
        ) : (
          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "12px", // Increased gap for better visual breathing room
            width: "100%",
            alignItems: "stretch"
          }}>
            {filtered.map(todo => (
              <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggle={() => handleToggle(todo)} 
                onEdit={() => setModal({ mode: "edit", todo })} 
                onDelete={() => setDeleteTarget(todo)} 
              />
            ))}
          </div>
        )}
      </main>

      {modal && <TodoModal mode={modal.mode} initial={modal.todo} onClose={() => setModal(null)} onSave={handleSave} />}
      {deleteTarget && <DeleteConfirm title={deleteTarget.title} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}

      {toastMsg && (
        <div style={{ position: "fixed", bottom: "24px", left: "50%", transform: "translateX(-50%)", background: "var(--surface-3)", border: "1px solid var(--border-light)", borderRadius: "99px", padding: "10px 20px", fontSize: "14px", fontWeight: 500, boxShadow: "var(--shadow-lg)", zIndex: 100, display: "flex", alignItems: "center", gap: "8px", color: "var(--text)", animation: "fadeIn 0.3s ease" }}>
          <Check size={14} color="var(--success)" /> {toastMsg}
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translate(-50%, 8px); } to { opacity: 1; transform: translate(-50%, 0); } }`}</style>
    </div>
  );
}