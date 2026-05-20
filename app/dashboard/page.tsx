"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [rank, setRank] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const authUser = auth?.user;

      if (!authUser) return;

      setUser(authUser);

      const { data: profileData } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      setProfile(profileData);

      // Get cohort leaderboard
      const { data: lb } = await supabase
        .from("users")
        .select("nickname, total_score")
        .eq("cohort_id", profileData?.cohort_id)
        .order("total_score", { ascending: false });

      if (lb) {
        setLeaderboard(lb);

        // find rank
        const index = lb.findIndex(
          (u) => u.nickname === profileData?.nickname
        );

        setRank(index + 1);
      }
    };

    load();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-lg bg-white border p-6 rounded-xl shadow">

        <h1 className="text-2xl font-bold mb-4">
          Dashboard 🚀
        </h1>

        {user && profile ? (
          <>
            <div className="mb-4">
              <p>Email: {user.email}</p>
              <p className="font-bold">
                Nickname: {profile.nickname}
              </p>
              <p>Score: {profile.total_score}</p>
              <p className="text-blue-600 font-bold">
                Your Rank: #{rank}
              </p>
            </div>

            <hr className="my-4" />

            <h2 className="font-bold mb-2">
              Cohort Leaderboard 🏆
            </h2>

            <div className="space-y-1">
              {leaderboard.map((u, i) => (
                <div
                  key={i}
                  className="flex justify-between border-b py-1"
                >
                  <span>
                    #{i + 1} {u.nickname}
                  </span>
                  <span>{u.total_score}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </main>
  );
}
