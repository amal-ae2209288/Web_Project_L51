import { NextResponse } from "next/server";
import { addComment, getComments } from "@/lib/repository";

function safeUser(user) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

function safeComment(comment) {
  return {
    ...comment,
    author: safeUser(comment.author),
  };
}

export async function GET(request, { params }) {
  const { id } = await params;

  const comments = await getComments(id);
  return NextResponse.json(comments.map(safeComment));
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { authorId, text } = body;

    if (!authorId || !text) {
      return NextResponse.json(
        { error: "authorId and text are required" },
        { status: 400 }
      );
    }

    const comment = await addComment(authorId, id, text);
    return NextResponse.json(safeComment(comment), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}