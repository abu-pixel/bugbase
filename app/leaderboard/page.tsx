"use client";

import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/leaderboard");
      const json = await res.json();
      setData(json);
    };

    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md border p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-4">Leaderboard 🏆</h1>

        {data.map((user: any, index) => (
          <div
            key={index}
            className="flex justify-between border-b py-2"
          >
            <span>
              #{index + 1} {user.nickname}
            </span>
            <span className="font-bold">{user.total_score}</span>
          </div>
        ))}
      </div>
    </main>
  );
}