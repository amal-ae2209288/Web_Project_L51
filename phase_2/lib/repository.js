import prisma from "./prisma.js";

// USERS

export async function getUserById(userId) {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      posts: true,
      followers: true,
      following: true
    }
  });
}

export async function getUserByUsername(username) {
  return await prisma.user.findUnique({
    where: { username }
  });
}

// POSTS (FEED)
export async function getFeed(userId) {
  return await prisma.post.findMany({
    where: {
      author: {
        followers: {
          some: {
            followerId: userId
          }
        }
      }
    },
    include: {
      author: true,
      likes: true,
      comments: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function getAllPosts() {
  return await prisma.post.findMany({
    include: {
      author: true,
      likes: true,
      comments: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });
}

export async function createPost(authorId, content) {
  return await prisma.post.create({
    data: {
      authorId,
      content
    }
  });
}

export async function deletePost(postId) {
  return await prisma.post.delete({
    where: { id: postId }
  });
}


// LIKES
export async function likePost(userId, postId) {
  return await prisma.like.upsert({
    where: {
      userId_postId: {
        userId,
        postId
      }
    },
    update: {},
    create: {
      userId,
      postId
    }
  });
}

export async function unlikePost(userId, postId) {
  return await prisma.like.delete({
    where: {
      userId_postId: {
        userId,
        postId
      }
    }
  });
}

export async function getLikesCount(postId) {
  return await prisma.like.count({
    where: { postId }
  });
}

// COMMENTS
export async function addComment(authorId, postId, text) {
  return await prisma.comment.create({
    data: {
      authorId,
      postId,
      text
    }
  });
}

export async function getComments(postId) {
  return await prisma.comment.findMany({
    where: { postId },
    include: {
      author: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });
}


//FOLLOW SYSTEM
export async function followUser(followerId, followedId) {
  return await prisma.follow.upsert({
    where: {
      followerId_followedId: {
        followerId,
        followedId
      }
    },
    update: {},
    create: {
      followerId,
      followedId
    }
  });
}

export async function unfollowUser(followerId, followedId) {
  return await prisma.follow.delete({
    where: {
      followerId_followedId: {
        followerId,
        followedId
      }
    }
  });
}

export async function getFollowersCount(userId) {
  return await prisma.follow.count({
    where: {
      followedId: userId
    }
  });
}

export async function getFollowingCount(userId) {
  return await prisma.follow.count({
    where: {
      followerId: userId
    }
  });
}