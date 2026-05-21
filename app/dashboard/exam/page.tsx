"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ExamPage() {
  const [exam, setExam] = useState<any>(null);
  const [answers, setAnswers] = useState<string>("");
  const [started, setStarted] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);

  useEffect(() => {
    const loadExam = async () => {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("exam")
        .select("*")
        .limit(1)
        .single();

      setExam(data);
    };

    loadExam();

    // 🚨 ANTI-CHEAT: TAB SWITCH DETECTION
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches((prev) => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const submitExam = async () => {
    if (tabSwitches > 2) {
      alert("Exam failed due to suspicious activity 🚫");
      return;
    }

    const { data: auth } = await supabase.auth.getUser();

    await supabase.from("exam_submissions").insert({
      user_id: auth.user?.id,
      answers,
      tab_switches: tabSwitches,
      score: 0, // will be calculated server-side later
    });

    alert("Exam submitted successfully");
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Exam Mode 🎓</h1>

      <p>Tab switches detected: {tabSwitches}</p>

      {!exam ? (
        <p>Loading exam...</p>
      ) : (
        <div>
          <h3>{exam.title}</h3>

          <textarea
            style={{ width: "100%", height: 150 }}
            onChange={(e) => setAnswers(e.target.value)}
          />

          <button onClick={submitExam}>Submit</button>
        </div>
      )}
    </main>
  );
}