"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async () => {
    // create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (!user) {
      alert("User creation failed");
      return;
    }

    // get all cohorts
    const { data: cohorts, error: cohortError } = await supabase
      .from("cohorts")
      .select("*");

    if (cohortError || !cohorts || cohorts.length === 0) {
      alert("No cohorts found");
      return;
    }

    // assign random cohort
    const randomCohort =
      cohorts[Math.floor(Math.random() * cohorts.length)];

    // insert into users table
    const { error: insertError } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email,
        role: "user",
        cohort_id: randomCohort.id,
      });

    if (insertError) {
      alert(insertError.message);
      return;
    }

    alert("Signup successful 🚀");

    window.location.href = "/dashboard";
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#0f172a",
        color: "white",
      }}
    >
      <div
        style={{
          width: 350,
          padding: 30,
          borderRadius: 12,
          background: "#1e293b",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h1 style={{ margin: 0 }}>BugBase Signup 🚀</h1>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: "none",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            border: "none",
          }}
        />

        <button
          onClick={handleSignup}
          style={{
            padding: 12,
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Create Account
        </button>
      </div>
    </main>
  );
}