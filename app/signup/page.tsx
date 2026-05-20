"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create auth user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      const user = data?.user;

      if (!user) {
        setError("User creation failed or still pending.");
        setLoading(false);
        return;
      }

      // 2. Get today's date
      const today = new Date().toISOString().split("T")[0];

      // 3. Check if today's cohort exists
      const { data: existingCohort } = await supabase
        .from("cohorts")
        .select("*")
        .eq("start_date", today)
        .single();

      let cohortId;

      // 4. Create cohort if not exists
      if (!existingCohort) {
        const { data: newCohort, error: cohortError } = await supabase
          .from("cohorts")
          .insert({
            start_date: today,
            end_date: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0],
            status: "active",
          })
          .select()
          .single();

        if (cohortError) {
          setError(cohortError.message);
          setLoading(false);
          return;
        }

        cohortId = newCohort?.id;
      } else {
        cohortId = existingCohort.id;
      }

      // 5. Insert user profile into database
      const { error: profileError } = await supabase.from("users").insert({
        id: user.id,
        email,
        nickname,
        total_score: 0,
        cohort_id: cohortId,
      });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setLoading(false);

      // 6. Go to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md p-6 border rounded-xl">
        <h1 className="text-2xl font-bold mb-4">Signup 🚀</h1>

        <input
          className="w-full p-2 border mb-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 border mb-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          className="w-full p-2 border mb-2"
          placeholder="Nickname"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-black text-white p-2 mt-2"
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </div>
    </main>
  );
}