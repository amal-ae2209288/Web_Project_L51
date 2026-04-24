import {
  getUserById,
  getAllPosts,
  createPost,
  likePost,
  getComments,
  followUser,
  deletePost,
  unfollowUser,
} from "./lib/repository.js";

console.log("Running test...");

async function test() {
  console.log("Testing repository...\n");

  const testUserId = "u1773870660945-0oibkj5v7";
  const targetFollowId = "u1773870660945-ph0ga1bpl";
  let newPost = null;
  let didFollow = false;

  try {
    // 1. Test get users
    const user = await getUserById(testUserId);
    console.log("User:", user?.username);

    if (!user) {
      throw new Error(`Test user not found: ${testUserId}`);
    }

    // 2. Test get posts
    const posts = await getAllPosts();
    console.log("Posts count:", posts.length);

    // 3. Test create post
    newPost = await createPost(
      user.id,
      `Repository test post ${new Date().toISOString()}`
    );
    console.log("Created post:", newPost.content);

    // 4. Test like
    await likePost(user.id, newPost.id);
    console.log("Liked post");

    // 5. Test comments
    if (posts.length > 0) {
      const comments = await getComments(posts[0].id);
      console.log("Comments count:", comments.length);
    } else {
      console.log("Comments count: skipped because there are no existing posts");
    }

    // 6. Test follow
    await followUser(user.id, targetFollowId);
    didFollow = true;
    console.log("Follow success");

    console.log("\nAll tests executed");
  } finally {
    // Cleanup keeps this script safe to run repeatedly.
    if (didFollow) {
      await unfollowUser(testUserId, targetFollowId).catch(() => {});
      console.log("Cleaned up follow");
    }

    if (newPost) {
      await deletePost(newPost.id).catch(() => {});
      console.log("Cleaned up test post");
    }
  }
}

test().catch(console.error);
