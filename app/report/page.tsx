"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function ReportPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("Low");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // -----------------------------
  // SCORE CALCULATION
  // -----------------------------
  const calculateScore = () => {
    let points = 0;

    if (description.length > 50) points += 2;
    if (title.length > 10) points += 1;

    if (severity === "High") points += 2;
    if (severity === "Critical") points += 3;

    if (file) points += 2;

    return points;
  };

  // -----------------------------
  // SUBMIT REPORT
  // -----------------------------
  const submitReport = async () => {
    setLoading(true);
    setMessage("");

    try {
      // 1. Get logged-in user
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        setMessage("You must be logged in");
        setLoading(false);
        return;
      }

      // 2. Get user profile
      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!profile) {
        setMessage("Profile not found");
        setLoading(false);
        return;
      }

      // 3. UPLOAD SCREENSHOT (if exists)
      let screenshotUrl = "";

      if (file) {
        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabase.storage
          .from("bug-screenshots")
          .upload(fileName, file);

        if (uploadError) {
          setMessage(uploadError.message);
          setLoading(false);
          return;
        }

        const { data } = supabase.storage
          .from("bug-screenshots")
          .getPublicUrl(fileName);

        screenshotUrl = data.publicUrl;
      }

      // -----------------------------
      // 4. DUPLICATE DETECTION LOGIC
      // -----------------------------
      let duplicatePenalty = 0;

      const { data: recentReports } = await supabase
        .from("daily_reports")
        .select("title, description")
        .eq("cohort_id", profile.cohort_id)
        .limit(20);

      if (recentReports && recentReports.length > 0) {
        for (const r of recentReports) {
          const isDuplicate =
            r.title.toLowerCase().includes(title.toLowerCase()) ||
            r.description.toLowerCase().includes(description.toLowerCase());

          if (isDuplicate) {
            duplicatePenalty = 50; // strong penalty
            break;
          }
        }
      }

      // 5. CALCULATE SCORE
      let score = calculateScore() - duplicatePenalty;

      if (score < 0) score = 0;

      // 6. INSERT REPORT
      const { error } = await supabase.from("daily_reports").insert({
        user_id: user.id,
        cohort_id: profile.cohort_id,
        title,
        description,
        severity,
        score,
        screenshot_url: screenshotUrl,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      // 7. UPDATE USER SCORE
      await supabase.rpc("update_user_score", {
  user_id: user.id,
  new_score: score,
});

      // 8. SUCCESS
      setLoading(false);
      setMessage(`Report submitted! +${score} points`);

      router.push("/leaderboard");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md border p-6 rounded-xl">

        <h1 className="text-2xl font-bold mb-4">
          Submit Bug Report 🐞
        </h1>

        <input
          className="w-full p-2 border mb-2"
          placeholder="Bug title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full p-2 border mb-2"
          placeholder="Bug description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select
          className="w-full p-2 border mb-2"
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
          <option>Critical</option>
        </select>

        <input
          type="file"
          className="w-full mb-2"
          onChange={(e) =>
            setFile(e.target.files?.[0] || null)
          }
        />

        {message && (
          <p className="text-blue-600 text-sm mb-2">
            {message}
          </p>
        )}

        <button
          onClick={submitReport}
          disabled={loading}
          className="w-full bg-black text-white p-2"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </main>
  );
}