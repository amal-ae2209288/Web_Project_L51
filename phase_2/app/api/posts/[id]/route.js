import { NextResponse } from "next/server";
import { deletePost } from "@/lib/repository";

function safeUser(user) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

function safePost(post) {
  return {
    ...post,
    author: safeUser(post.author),
  };
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const deleted = await deletePost(id);

    return NextResponse.json({
      message: "Post deleted",
      post: safePost(deleted),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 404 }
    );
  }
}