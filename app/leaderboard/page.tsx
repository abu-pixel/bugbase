"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");

      const data = await response.json();

      if (data.error) {
        console.error(data.error);
        setLoading(false);
        return;
      }

      setUsers(data);
      setLoading(false);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: 20,
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          maxWidth: 900,
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: 36,
            marginBottom: 10,
          }}
        >
          🏆 BugBase Leaderboard
        </h1>

        <p
          style={{
            color: "#94a3b8",
            marginBottom: 30,
          }}
        >
          Real-time cohort rankings and tester scores
        </p>

        {loading ? (
          <p>Loading leaderboard...</p>
        ) : users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 15,
            }}
          >
            {users.map((user, index) => (
              <div
                key={user.id}
                style={{
                  background: "#1e293b",
                  padding: 20,
                  borderRadius: 14,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border:
                    index === 0
                      ? "2px solid gold"
                      : "1px solid #334155",
                }}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: 22,
                    }}
                  >
                    #{index + 1}
                  </h2>

                  <p
                    style={{
                      margin: "8px 0 0 0",
                      color: "#cbd5e1",
                    }}
                  >
                    {user.email}
                  </p>

                  <p
                    style={{
                      margin: "4px 0 0 0",
                      color: "#94a3b8",
                      fontSize: 14,
                    }}
                  >
                    Role: {user.role || "tester"}
                  </p>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      color: "#22c55e",
                      fontSize: 28,
                    }}
                  >
                    {user.total_score || 0}
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "#94a3b8",
                    }}
                  >
                    points
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}