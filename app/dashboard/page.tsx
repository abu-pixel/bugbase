"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [cohort, setCohort] = useState<any>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // 1. Get authenticated user
        const { data: authData } = await supabase.auth.getUser();

        if (!authData?.user) {
          window.location.href = "/login";
          return;
        }

        // 2. Get user row safely
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("id", authData.user.id)
          .single();

        if (userError) {
          console.error("User fetch error:", userError);
          setLoading(false);
          return;
        }

        setUser(userData);

        // 3. Get cohort safely (NO JOINS, NO ASSUMPTIONS)
        if (userData?.cohort_id) {
          const { data: cohortData, error: cohortError } = await supabase
            .from("cohorts")
            .select("*")
            .eq("id", userData.cohort_id)
            .single();

          if (!cohortError) {
            setCohort(cohortData);
          }
        }
      } catch (err) {
        console.error("Unexpected dashboard error:", err);
      }

      setLoading(false);
    };

    loadDashboard();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
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
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1>Dashboard 🚀</h1>

        <button
          onClick={logout}
          style={{
            padding: "8px 12px",
            background: "#ef4444",
            border: "none",
            color: "white",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {loading ? (
        <p style={{ marginTop: 20 }}>Loading...</p>
      ) : !user ? (
        <p>No user found</p>
      ) : (
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              background: "#1e293b",
              padding: 15,
              borderRadius: 10,
              marginBottom: 15,
            }}
          >
            <h3>User Info</h3>
            <p>Email: {user.email || "N/A"}</p>
            <p>Role: {user.role || "user"}</p>
            <p>User ID: {user.id}</p>
          </div>

          <div
            style={{
              background: "#1e293b",
              padding: 15,
              borderRadius: 10,
            }}
          >
            <h3>Cohort Info</h3>

            <p>Cohort ID: {user.cohort_id || "Not assigned"}</p>

            <pre style={{ fontSize: 12, opacity: 0.9 }}>
              {cohort ? JSON.stringify(cohort, null, 2) : "No cohort data"}
            </pre>
          </div>
        </div>
      )}
    </main>
  );
}