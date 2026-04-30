import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const todo = db.todos.findById(id);
  if (!todo || todo.userId !== session.user.id)
    return NextResponse.json({ error: "Todo not found." }, { status: 404 });
  return NextResponse.json(todo);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    const todo = db.todos.findById(id);
    if (!todo || todo.userId !== session.user.id)
      return NextResponse.json({ error: "Todo not found." }, { status: 404 });

    const body = await req.json();
    const { title, description, completed, priority, dueDate } = body;

    if (title !== undefined) {
      if (!title || title.trim().length === 0)
        return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      if (title.trim().length > 200)
        return NextResponse.json({ error: "Title must be 200 characters or less." }, { status: 400 });
    }

    const validPriorities = ["low", "medium", "high"];
    if (priority !== undefined && !validPriorities.includes(priority))
      return NextResponse.json({ error: "Invalid priority." }, { status: 400 });

    const updated = db.todos.update(id, {
      ...(title !== undefined && { title: title.trim() }),
      ...(description !== undefined && { description: description.trim() || undefined }),
      ...(completed !== undefined && { completed }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate || undefined }),
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const todo = db.todos.findById(id);
  if (!todo || todo.userId !== session.user.id)
    return NextResponse.json({ error: "Todo not found." }, { status: 404 });
  db.todos.delete(id);
  return NextResponse.json({ message: "Todo deleted successfully." });
}