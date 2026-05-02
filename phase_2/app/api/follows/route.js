import { NextResponse } from "next/server";
import { followUser, unfollowUser } from "@/lib/repository";

export async function POST(request) {
  try {
    const body = await request.json();
    const { followerId, followedId } = body;

    if (!followerId || !followedId) {
      return NextResponse.json(
        { error: "followerId and followedId are required" },
        { status: 400 }
      );
    }

    if (followerId === followedId) {
      return NextResponse.json(
        { error: "You cannot follow yourself" },
        { status: 400 }
      );
    }

    const follow = await followUser(followerId, followedId);
    return NextResponse.json(follow, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to follow user" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json();
    const { followerId, followedId } = body;

    if (!followerId || !followedId) {
      return NextResponse.json(
        { error: "followerId and followedId are required" },
        { status: 400 }
      );
    }

    await unfollowUser(followerId, followedId);

    return NextResponse.json({
      message: "User unfollowed",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to unfollow user" },
      { status: 404 }
    );
  }
}