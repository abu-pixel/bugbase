"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ActivityFeedPage() {
  const [feed, setFeed] = useState<any[]>([]);

  useEffect(() => {
    loadFeed();

    const channel = supabase
      .channel("activity-feed-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activity_feed",
        },
        (payload) => {
          setFeed((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadFeed = async () => {
    const { data } = await supabase
      .from("activity_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(30);

    if (data) setFeed(data);
  };

  return (
    <main style={{ padding: 20, background: "#0f172a", color: "white" }}>
      <h1>Live Activity Feed ⚡</h1>

      {feed.map((item) => (
        <div
          key={item.id}
          style={{
            marginTop: 10,
            padding: 12,
            background: "#1e293b",
            borderRadius: 8,
          }}
        >
          <h3 style={{ margin: 0 }}>{item.action}</h3>
          <p style={{ fontSize: 12, opacity: 0.8 }}>
            User: {item.user_id}
          </p>
          <pre style={{ fontSize: 11 }}>
            {JSON.stringify(item.meta, null, 2)}
          </pre>
        </div>
      ))}
    </main>
  );
}