"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type TopUser = {
  id: string;
  name: string;
  username: string;
  _count: {
    followers: number;
  };
};

type Stats = {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  totalLikes: number;
  averagePostsPerUser: number;
  topFollowedUsers: TopUser[];
};

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((response) => response.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return <main style={styles.page}>Loading stats...</main>;
  }

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1>Statistics Dashboard</h1>
          <p style={styles.muted}>Loaded from /api/stats</p>
        </div>

        <a href="/" style={styles.link}>
          Back Home
        </a>
      </header>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h3>Total Users</h3>
          <p style={styles.number}>{stats.totalUsers}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Posts</h3>
          <p style={styles.number}>{stats.totalPosts}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Comments</h3>
          <p style={styles.number}>{stats.totalComments}</p>
        </div>

        <div style={styles.card}>
          <h3>Total Likes</h3>
          <p style={styles.number}>{stats.totalLikes}</p>
        </div>

        <div style={styles.card}>
          <h3>Average Posts Per User</h3>
          <p style={styles.number}>{stats.averagePostsPerUser.toFixed(2)}</p>
        </div>

        <div style={styles.card}>
          <h3>Top 5 Followed Users</h3>

          {stats.topFollowedUsers.map((user) => (
            <p key={user.id}>
              @{user.username} — {user._count.followers} followers
            </p>
          ))}
        </div>
      </section>
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
  },
  muted: {
    color: "#667085",
  },
  link: {
    color: "#2563eb",
    fontWeight: 700,
  },
  grid: {
    maxWidth: 1100,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 20,
  },
  card: {
    background: "white",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",
  },
  number: {
    fontSize: 32,
    fontWeight: 800,
  },
};