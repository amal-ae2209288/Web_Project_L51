"use client";

import type { CSSProperties, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";

type Follow = {
  id: string;
  followerId: string;
  followedId: string;
};

type Like = {
  id: string;
  userId: string;
  postId: string;
};

type User = {
  id: string;
  name: string;
  username: string;
  email?: string;
  bio?: string | null;
  avatar?: string | null;
  followers?: Follow[];
  following?: Follow[];
  _count?: {
    posts?: number;
    followers?: number;
    following?: number;
  };
};

type Comment = {
  id: string;
  text: string;
  createdAt: string;
  authorId: string;
  postId: string;
  author?: User;
};

type Post = {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
  author?: User;
  likes?: Like[];
  comments?: Comment[];
  _count?: {
    likes?: number;
    comments?: number;
  };
};

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupError, setSignupError] = useState("");

  const [postContent, setPostContent] = useState("");
  const [commentTextByPost, setCommentTextByPost] = useState<Record<string, string>>({});

  const [profileName, setProfileName] = useState("");
  const [profileBio, setProfileBio] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");

  const otherUsers = useMemo(() => {
    if (!currentUser) return [];
    return users.filter((user) => user.id !== currentUser.id);
  }, [users, currentUser]);

  async function loadData(userId?: string) {
    const usersData = await fetchJson<User[]>("/api/users");
    setUsers(usersData);

    if (userId) {
      const current = await fetchJson<User>(`/api/users/${userId}`);
      setCurrentUser(current);
      setProfileName(current.name || "");
      setProfileBio(current.bio || "");
      setProfileAvatar(current.avatar || "");

      const postsData = await fetchJson<Post[]>(`/api/posts?userId=${userId}`);
      setPosts(postsData);
    } else {
      const postsData = await fetchJson<Post[]>("/api/posts");
      setPosts(postsData);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedUserId = localStorage.getItem("currentUserId");

      if (savedUserId) {
        loadData(savedUserId).catch(() => {
          localStorage.removeItem("currentUserId");
          setCurrentUser(null);
        });
      } else {
        loadData().catch(console.error);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();

    const user = await fetchJson<User>("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: loginUsername,
        password: loginPassword,
      }),
    });

    localStorage.setItem("currentUserId", user.id);
    await loadData(user.id);

    setLoginUsername("");
    setLoginPassword("");
  }

  async function handleSignup(event: FormEvent) {
    event.preventDefault();
    setSignupError("");

    try {
      const user = await fetchJson<User>("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupName,
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
        }),
      });

      localStorage.setItem("currentUserId", user.id);
      await loadData(user.id);

      setSignupName("");
      setSignupUsername("");
      setSignupEmail("");
      setSignupPassword("");
    } catch (error) {
      setSignupError(
        error instanceof Error ? error.message : "Failed to create account"
      );
    }
  }

  async function handleLogout() {
    localStorage.removeItem("currentUserId");
    setCurrentUser(null);
    await loadData();
  }

  async function handleCreatePost() {
    if (!currentUser || !postContent.trim()) return;

    await fetchJson<Post>("/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authorId: currentUser.id,
        content: postContent,
      }),
    });

    setPostContent("");
    await loadData(currentUser.id);
  }

  async function handleDeletePost(postId: string) {
    if (!currentUser) return;

    await fetchJson(`/api/posts/${postId}`, {
      method: "DELETE",
    });

    await loadData(currentUser.id);
  }

  async function handleToggleLike(post: Post) {
    if (!currentUser) return;

    const alreadyLiked = post.likes?.some((like) => like.userId === currentUser.id);

    await fetchJson(`/api/posts/${post.id}/likes`, {
      method: alreadyLiked ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: currentUser.id,
      }),
    });

    await loadData(currentUser.id);
  }

  async function handleAddComment(postId: string) {
    if (!currentUser) return;

    const text = commentTextByPost[postId]?.trim();
    if (!text) return;

    await fetchJson(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authorId: currentUser.id,
        text,
      }),
    });

    setCommentTextByPost((previous) => ({
      ...previous,
      [postId]: "",
    }));

    await loadData(currentUser.id);
  }

  async function handleToggleFollow(profileUser: User) {
    if (!currentUser) return;

    const alreadyFollowing = currentUser.following?.some(
      (follow) => follow.followedId === profileUser.id
    );

    await fetchJson("/api/follows", {
      method: alreadyFollowing ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        followerId: currentUser.id,
        followedId: profileUser.id,
      }),
    });

    await loadData(currentUser.id);
  }

  async function handleUpdateProfile(event: FormEvent) {
    event.preventDefault();

    if (!currentUser) return;

    await fetchJson<User>(`/api/users/${currentUser.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: profileName,
        bio: profileBio,
        avatar: profileAvatar,
      }),
    });

    await loadData(currentUser.id);
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Social Wave</h1>
          <p style={styles.muted}>API + frontend wiring</p>
        </div>

        <a href="/stats" style={styles.link}>
          Stats Dashboard
        </a>

        {currentUser && (
          <button onClick={handleLogout} style={styles.buttonGhost}>
            Logout @{currentUser.username}
          </button>
        )}
      </header>

      {!currentUser && (
        <section style={styles.gridTwo}>
          <form onSubmit={handleLogin} style={styles.card}>
            <h2>Login</h2>

            <input
              style={styles.input}
              placeholder="Username"
              value={loginUsername}
              onChange={(event) => setLoginUsername(event.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Password"
              type="password"
              value={loginPassword}
              onChange={(event) => setLoginPassword(event.target.value)}
            />

            <button style={styles.button} type="submit">
              Login
            </button>
          </form>

          <form onSubmit={handleSignup} style={styles.card}>
            <h2>Signup</h2>

            <input
              style={styles.input}
              placeholder="Name"
              value={signupName}
              onChange={(event) => setSignupName(event.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Username"
              value={signupUsername}
              onChange={(event) => setSignupUsername(event.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Email"
              value={signupEmail}
              onChange={(event) => setSignupEmail(event.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Password"
              type="password"
              value={signupPassword}
              onChange={(event) => setSignupPassword(event.target.value)}
            />

            {signupError && <p style={styles.error}>{signupError}</p>}

            <button style={styles.button} type="submit">
              Create Account
            </button>
          </form>
        </section>
      )}

      {currentUser && (
        <section style={styles.layout}>
          <section style={styles.card}>
            <h2>Profile</h2>

            <form onSubmit={handleUpdateProfile}>
              <input
                style={styles.input}
                placeholder="Name"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Bio"
                value={profileBio}
                onChange={(event) => setProfileBio(event.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Avatar URL"
                value={profileAvatar}
                onChange={(event) => setProfileAvatar(event.target.value)}
              />

              <button style={styles.button} type="submit">
                Save Profile
              </button>
            </form>

            <p style={styles.muted}>
              Posts: {currentUser._count?.posts || 0} | Followers:{" "}
              {currentUser._count?.followers || 0} | Following:{" "}
              {currentUser._count?.following || 0}
            </p>
          </section>

          <section style={styles.card}>
            <h2>Create Post</h2>

            <textarea
              style={styles.textarea}
              placeholder="What's happening?"
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
            />

            <button style={styles.button} onClick={handleCreatePost}>
              Post
            </button>
          </section>

          <section style={styles.card}>
            <h2>Discover Users</h2>

            {otherUsers.map((profileUser) => {
              const alreadyFollowing = currentUser.following?.some(
                (follow) => follow.followedId === profileUser.id
              );

              return (
                <article key={profileUser.id} style={styles.userRow}>
                  <div>
                    <strong>{profileUser.name}</strong>
                    <p style={styles.muted}>@{profileUser.username}</p>
                    <p>{profileUser.bio || "No bio yet."}</p>
                    <p style={styles.muted}>
                      Posts: {profileUser._count?.posts || 0} | Followers:{" "}
                      {profileUser._count?.followers || 0}
                    </p>
                  </div>

                  <button
                    style={alreadyFollowing ? styles.buttonGhost : styles.button}
                    onClick={() => handleToggleFollow(profileUser)}
                  >
                    {alreadyFollowing ? "Unfollow" : "Follow"}
                  </button>
                </article>
              );
            })}
          </section>

          <section style={styles.cardWide}>
            <h2>Feed</h2>

            {posts.length === 0 && <p style={styles.muted}>No posts yet.</p>}

            {posts.map((post) => {
              const liked = post.likes?.some((like) => like.userId === currentUser.id);
              const likesCount = post._count?.likes ?? post.likes?.length ?? 0;
              const comments = post.comments || [];

              return (
                <article key={post.id} style={styles.post}>
                  <div style={styles.postHeader}>
                    <div>
                      <strong>{post.author?.name || "Unknown"}</strong>
                      <p style={styles.muted}>
                        @{post.author?.username || "unknown"} • {formatTime(post.createdAt)}
                      </p>
                    </div>

                    {post.authorId === currentUser.id && (
                      <button
                        style={styles.deleteButton}
                        onClick={() => handleDeletePost(post.id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>

                  <p>{post.content}</p>

                  <button
                    style={liked ? styles.buttonGhost : styles.button}
                    onClick={() => handleToggleLike(post)}
                  >
                    {liked ? "Unlike" : "Like"} ({likesCount})
                  </button>

                  <div style={styles.comments}>
                    <h4>Comments</h4>

                    {comments.map((comment) => (
                      <p key={comment.id} style={styles.comment}>
                        <strong>{comment.author?.name || "User"}:</strong> {comment.text}
                      </p>
                    ))}

                    <div style={styles.commentBox}>
                      <input
                        style={styles.input}
                        placeholder="Write a comment..."
                        value={commentTextByPost[post.id] || ""}
                        onChange={(event) =>
                          setCommentTextByPost((previous) => ({
                            ...previous,
                            [post.id]: event.target.value,
                          }))
                        }
                      />

                      <button
                        style={styles.button}
                        onClick={() => handleAddComment(post.id)}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        </section>
      )}
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    padding: 32,
    background: "#f3f7ff",
    color: "#172033",
    fontFamily: "Arial, sans-serif",
  },
  header: {
    maxWidth: 1100,
    margin: "0 auto 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  title: {
    margin: 0,
    fontSize: 36,
  },
  muted: {
    color: "#667085",
    margin: "4px 0",
  },
  error: {
    color: "#b42318",
    background: "#fffbfa",
    border: "1px solid #fecdca",
    borderRadius: 10,
    padding: 10,
    margin: "0 0 12px",
  },
  link: {
    color: "#2563eb",
    fontWeight: 700,
  },
  gridTwo: {
    maxWidth: 900,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 20,
  },
  layout: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
  },
  cardWide: {
    background: "white",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
    gridColumn: "1 / -1",
  },
  input: {
    width: "100%",
    padding: 12,
    marginBottom: 12,
    border: "1px solid #d0d5dd",
    borderRadius: 10,
  },
  textarea: {
    width: "100%",
    minHeight: 100,
    padding: 12,
    marginBottom: 12,
    border: "1px solid #d0d5dd",
    borderRadius: 10,
  },
  button: {
    border: 0,
    background: "#2563eb",
    color: "white",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  buttonGhost: {
    border: "1px solid #d0d5dd",
    background: "white",
    color: "#172033",
    padding: "10px 14px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  deleteButton: {
    border: 0,
    background: "#dc2626",
    color: "white",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },
  userRow: {
    borderTop: "1px solid #e4e7ec",
    paddingTop: 14,
    marginTop: 14,
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },
  post: {
    borderTop: "1px solid #e4e7ec",
    paddingTop: 18,
    marginTop: 18,
  },
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
  },
  comments: {
    marginTop: 14,
    background: "#f9fafb",
    padding: 12,
    borderRadius: 12,
  },
  comment: {
    margin: "8px 0",
  },
  commentBox: {
    display: "flex",
    gap: 8,
    marginTop: 12,
  },
};
