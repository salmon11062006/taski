import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const todos = db.todos.findByUser(session.user.id);
  return NextResponse.json(todos);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { title, description, priority, dueDate } = await req.json();

    if (!title || title.trim().length === 0)
      return NextResponse.json({ error: "Title is required." }, { status: 400 });

    if (title.trim().length > 200)
      return NextResponse.json({ error: "Title must be 200 characters or less." }, { status: 400 });

    const validPriorities = ["low", "medium", "high"];
    if (priority && !validPriorities.includes(priority))
      return NextResponse.json({ error: "Invalid priority." }, { status: 400 });

    const todo = db.todos.create({
      title: title.trim(),
      description: description?.trim() || undefined,
      completed: false,
      priority: priority || "medium",
      dueDate: dueDate || undefined,
      userId: session.user.id,
    });

    return NextResponse.json(todo, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}