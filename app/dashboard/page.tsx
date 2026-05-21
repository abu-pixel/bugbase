"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // 🔐 Get logged in auth user
        const { data: authData, error: authError } =
          await supabase.auth.getUser();

        if (authError || !authData.user) {
          window.location.href = "/login";
          return;
        }

        // 📦 Load user profile safely
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (error) {
          console.error("Dashboard load error:", error);
          setLoading(false);
          return;
        }

        setUserData(data);
        setLoading(false);
      } catch (err) {
        console.error("Unexpected dashboard error:", err);
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <main style={{ padding: 20 }}>
        <h1>Dashboard 🚀</h1>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main
      style={{
        padding: 20,
        fontFamily: "Arial",
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <h1>Dashboard 🚀</h1>

      {!userData ? (
        <p>No user data found.</p>
      ) : (
        <div
          style={{
            background: "#111",
            color: "white",
            padding: 20,
            borderRadius: 12,
            marginTop: 20,
          }}
        >
          <p>
            <strong>Email:</strong> {userData.email}
          </p>

          <p>
            <strong>Role:</strong> {userData.role || "user"}
          </p>

          <p>
            <strong>Cohort ID:</strong>{" "}
            {userData.cohort_id || "Not Assigned"}
          </p>

          <p>
            <strong>Total Score:</strong>{" "}
            {userData.total_score || 0}
          </p>

          <button
            onClick={logout}
            style={{
              marginTop: 20,
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              background: "#ff4d4f",
              color: "white",
              fontWeight: "bold",
            }}
          >
            Logout
          </button>
        </div>
      )}
    </main>
  );
}