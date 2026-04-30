import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");
const TODOS_FILE = path.join(DATA_DIR, "todos.json");
const SESSIONS_FILE = path.join(DATA_DIR, "sessions.json");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "[]");
  if (!fs.existsSync(TODOS_FILE)) fs.writeFileSync(TODOS_FILE, "[]");
  if (!fs.existsSync(SESSIONS_FILE)) fs.writeFileSync(SESSIONS_FILE, "[]");
}

function readJSON<T>(file: string): T[] {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8")) as T[];
  } catch {
    return [];
  }
}

function writeJSON<T>(file: string, data: T[]) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  image?: string;
  createdAt: string;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

// ── User operations ──────────────────────────────────────────────────────────
export const db = {
  users: {
    findByEmail(email: string): User | undefined {
      return readJSON<User>(USERS_FILE).find((u) => u.email === email);
    },
    findById(id: string): User | undefined {
      return readJSON<User>(USERS_FILE).find((u) => u.id === id);
    },
    create(data: Omit<User, "id" | "createdAt">): User {
      const users = readJSON<User>(USERS_FILE);
      const user: User = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        ...data,
      };
      users.push(user);
      writeJSON(USERS_FILE, users);
      return user;
    },
  },

  todos: {
    findByUser(userId: string): Todo[] {
      return readJSON<Todo>(TODOS_FILE)
        .filter((t) => t.userId === userId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    },
    findById(id: string): Todo | undefined {
      return readJSON<Todo>(TODOS_FILE).find((t) => t.id === id);
    },
    create(data: Omit<Todo, "id" | "createdAt" | "updatedAt">): Todo {
      const todos = readJSON<Todo>(TODOS_FILE);
      const todo: Todo = {
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      };
      todos.push(todo);
      writeJSON(TODOS_FILE, todos);
      return todo;
    },
    update(id: string, data: Partial<Omit<Todo, "id" | "userId" | "createdAt">>): Todo | null {
      const todos = readJSON<Todo>(TODOS_FILE);
      const idx = todos.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      todos[idx] = { ...todos[idx], ...data, updatedAt: new Date().toISOString() };
      writeJSON(TODOS_FILE, todos);
      return todos[idx];
    },
    delete(id: string): boolean {
      const todos = readJSON<Todo>(TODOS_FILE);
      const next = todos.filter((t) => t.id !== id);
      if (next.length === todos.length) return false;
      writeJSON(TODOS_FILE, next);
      return true;
    },
  },
};