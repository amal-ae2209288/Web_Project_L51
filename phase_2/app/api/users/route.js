import { NextResponse } from "next/server";
import { createUser, getAllUsers } from "@/lib/repository";

function safeUser(user) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";

  const users = await getAllUsers(search);
  return NextResponse.json(users.map(safeUser));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, username, email, password } = body;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "name, username, email, and password are required" },
        { status: 400 }
      );
    }

    const user = await createUser(body);
    return NextResponse.json(safeUser(user), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}