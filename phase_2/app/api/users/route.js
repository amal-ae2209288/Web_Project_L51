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
    const name = body.name?.trim();
    const username = body.username?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;

    if (!name || !username || !email || !password) {
      return NextResponse.json(
        { error: "name, username, email, and password are required" },
        { status: 400 }
      );
    }

    const user = await createUser({
      ...body,
      name,
      username,
      email,
      password,
    });
    return NextResponse.json(safeUser(user), { status: 201 });
  } catch (error) {
    console.error("Failed to create user", error);

    if (error?.code === "P2002") {
      const fields = Array.isArray(error.meta?.target)
        ? error.meta.target.join(" and ")
        : "username or email";

      return NextResponse.json(
        { error: `That ${fields} is already in use` },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
