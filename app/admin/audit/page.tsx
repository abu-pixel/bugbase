"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const { data } = await supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLogs(data);
  };

  return (
    <main style={{ padding: 20, background: "#0f172a", color: "white" }}>
      <h1>Audit Logs 📜</h1>

      {logs.map((log) => (
        <div
          key={log.id}
          style={{
            background: "#1e293b",
            padding: 12,
            marginTop: 10,
            borderRadius: 8,
          }}
        >
          <h3>{log.action}</h3>
          <p>User: {log.user_id}</p>
          <p>Entity: {log.entity_type}</p>
          <pre>{JSON.stringify(log.metadata, null, 2)}</pre>
        </div>
      ))}
    </main>
  );
}