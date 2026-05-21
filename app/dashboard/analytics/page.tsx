"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AnalyticsPage() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("users")
      .select("name, score");

    if (data) setData(data);
  };

  return (
    <main style={{ padding: 20, background: "#0f172a", color: "white" }}>
      <h1>Analytics Dashboard 📊</h1>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#38bdf8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2>Summary</h2>
        <p>Total Users: {data.length}</p>
      </div>
    </main>
  );
}