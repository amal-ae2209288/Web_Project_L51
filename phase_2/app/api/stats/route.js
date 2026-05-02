import { NextResponse } from "next/server";
import {
  getAveragePostsPerUser,
  getTopFollowedUsers,
  getTotalComments,
  getTotalLikes,
  getTotalPosts,
  getTotalUsers,
} from "@/lib/repository";

export async function GET() {
  const totalUsers = await getTotalUsers();
  const totalPosts = await getTotalPosts();
  const totalComments = await getTotalComments();
  const totalLikes = await getTotalLikes();
  const averagePostsPerUser = await getAveragePostsPerUser();
  const topFollowedUsers = await getTopFollowedUsers();

  return NextResponse.json({
    totalUsers,
    totalPosts,
    totalComments,
    totalLikes,
    averagePostsPerUser,
    topFollowedUsers,
  });
}