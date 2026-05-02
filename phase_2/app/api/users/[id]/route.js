import { NextResponse } from "next/server";
import { getUserById, updateUser } from "@/lib/repository";

function safeUser(user) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

export async function GET(request, { params }) {
  const { id } = await params;

  const user = await getUserById(id);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(safeUser(user));
}

async function updateHandler(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const user = await updateUser(id, body);
    return NextResponse.json(safeUser(user));
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  return updateHandler(request, context);
}

export async function PATCH(request, context) {
  return updateHandler(request, context);
}