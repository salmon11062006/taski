import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });

    if (password.length < 6)
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });

    const existing = db.users.findByEmail(email);
    if (existing)
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const user = db.users.create({ name, email, password: hashed });

    return NextResponse.json({ message: "Account created successfully.", userId: user.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error. Please try again." }, { status: 500 });
  }
}