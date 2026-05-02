import { NextResponse } from "next/server";
import { likePost, unlikePost } from "@/lib/repository";

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    const like = await likePost(userId, id);
    return NextResponse.json(like, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to like post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }

    await unlikePost(userId, id);

    return NextResponse.json({
      message: "Post unliked",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to unlike post" },
      { status: 404 }
    );
  }
}