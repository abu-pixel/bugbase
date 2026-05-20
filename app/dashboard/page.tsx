"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select(`
          email,
          role,
          cohorts(name)
        `)
        .eq("id", authData.user.id)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setUserData(data);
    };

    loadUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 40,
        background: "#0f172a",
        color: "white",
      }}
    >
      <h1>Dashboard 🚀</h1>

      {userData ? (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            borderRadius: 12,
            background: "#1e293b",
            width: 400,
          }}
        >
          <p>
            <strong>Email:</strong> {userData.email}
          </p>

          <p>
            <strong>Role:</strong> {userData.role}
          </p>

          <p>
            <strong>Cohort:</strong>{" "}
            {userData.cohorts?.name || "No cohort"}
          </p>
        </div>
      ) : (
        <p>Loading...</p>
      )}

      <button
        onClick={logout}
        style={{
          marginTop: 20,
          padding: 12,
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        Logout
      </button>
    </main>
  );
}