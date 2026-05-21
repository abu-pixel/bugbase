"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    const { data } = await supabase
      .from("teams")
      .select("*")
      .order("total_score", { ascending: false });

    if (data) setTeams(data);
  };

  return (
    <main style={{ padding: 20, background: "#0f172a", color: "white" }}>
      <h1>Team Battles ⚔️</h1>

      {teams.map((team, index) => (
        <div
          key={team.id}
          style={{
            marginTop: 10,
            padding: 12,
            background: "#1e293b",
            borderRadius: 8,
          }}
        >
          <h3>
            #{index + 1} {team.name}
          </h3>
          <p>Total Score: {team.total_score}</p>
        </div>
      ))}
    </main>
  );
}