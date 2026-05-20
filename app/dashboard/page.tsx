"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        window.location.href = "/login";
      }
    };

    checkUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <main style={{ padding: 40 }}>
      <h1>Dashboard</h1>
      <p>Welcome to BugBase 🚀</p>

      <button onClick={logout} style={{ marginTop: 20 }}>
        Logout
      </button>
    </main>
  );
}