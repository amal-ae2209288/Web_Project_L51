import { NextResponse } from "next/server";
import { createPost, getAllPosts, getFeed } from "@/lib/repository";

function safeUser(user) {
  if (!user) return user;
  const { password, ...safe } = user;
  return safe;
}

function safePost(post) {
  return {
    ...post,
    author: safeUser(post.author),
    comments: post.comments?.map((comment) => ({
      ...comment,
      author: safeUser(comment.author),
    })),
  };
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  const posts = userId ? await getFeed(userId) : await getAllPosts();
  return NextResponse.json(posts.map(safePost));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { authorId, content } = body;

    if (!authorId || !content) {
      return NextResponse.json(
        { error: "authorId and content are required" },
        { status: 400 }
      );
    }

    const post = await createPost(authorId, content);
    return NextResponse.json(safePost(post), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}