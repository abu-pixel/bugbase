"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { calculateBugScore } from "@/lib/aiScore";
import { logAction } from "@/lib/audit";

export default function ReportPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // 📸 Upload screenshot to Supabase storage
  const uploadImage = async () => {
    if (!file) return null;

    const fileName = `${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("bug-screenshots")
      .upload(fileName, file);

    if (error) {
      console.log("Upload error:", error.message);
      return null;
    }

    const { data: publicUrl } = supabase.storage
      .from("bug-screenshots")
      .getPublicUrl(data.path);

    return publicUrl.publicUrl;
  };

  // 🚀 MAIN SUBMIT FUNCTION (SECURE + AI + AUDIT + SCORING)
  const submitReport = async () => {
    setLoading(true);

    try {
      const { data: authData } = await supabase.auth.getUser();

      if (!authData.user) {
        alert("Login required");
        setLoading(false);
        return;
      }

      // 📸 upload image
      const imageUrl = await uploadImage();

      // 🤖 AI score calculation (quality-based)
      const aiScore = calculateBugScore(title, description);

      // 💾 insert report into database
      const { data, error } = await supabase
        .from("daily_reports")
        .insert({
          user_id: authData.user.id,
          title,
          description,
          image_url: imageUrl,
          status: "pending",
          ai_score: aiScore,
        })
        .select()
        .single();

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // 🔐 SERVER-SIDE SCORING (secure)
      await fetch("/api/score", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: authData.user.id,
          report_id: data.id,
          base_score: aiScore,
        }),
      });

      // 📜 AUDIT LOG (admin tracking)
      await logAction({
        user_id: authData.user.id,
        action: "SUBMIT_REPORT",
        entity_type: "daily_report",
        entity_id: data.id,
        metadata: {
          title,
          aiScore,
          hasImage: !!imageUrl,
        },
      });

      alert("Report submitted successfully 🚀");

      setTitle("");
      setDescription("");
      setFile(null);
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }

    setLoading(false);
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: 20,
      }}
    >
      <h1>Submit Bug Report 🐛</h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 500,
          marginTop: 20,
        }}
      >
        <input
          placeholder="Bug title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
          }}
        />

        <textarea
          placeholder="Bug description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{
            padding: 12,
            borderRadius: 8,
            minHeight: 150,
          }}
        />

        {/* 📸 Screenshot upload */}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {file && (
          <p style={{ color: "#38bdf8" }}>
            Selected: {file.name}
          </p>
        )}

        <button
          onClick={submitReport}
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold",
            background: loading ? "#334155" : "#2563eb",
            color: "white",
          }}
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </main>
  );
}