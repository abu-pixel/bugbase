"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function ExamPage() {
  const [loading, setLoading] = useState(true);

  const [userData, setUserData] = useState<any>(null);
  const [exam, setExam] = useState<any>(null);

  const [answers, setAnswers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  // LOAD EXAM
  useEffect(() => {
    loadExam();
  }, []);

  const loadExam = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // GET USER PROFILE
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      setLoading(false);
      return;
    }

    setUserData(profile);

    // GET COHORT
    const { data: cohort } = await supabase
      .from("cohorts")
      .select("*")
      .eq("id", profile.cohort_id)
      .single();

    // CHECK IF EXAM RELEASED
    if (
      !cohort ||
      cohort.status !== "testing" ||
      !cohort.assigned_exam_id
    ) {
      setLoading(false);
      return;
    }

    // GET EXAM
    const { data: examData } = await supabase
      .from("exams")
      .select("*")
      .eq("id", cohort.assigned_exam_id)
      .single();

    setExam(examData);

    setLoading(false);
  };

  // SUBMIT EXAM
  const submitExam = async () => {
    if (!exam) return;

    let score = 0;

    // SIMPLE AUTO SCORE
    answers.forEach((a) => {
      if (a.trim().length > 5) {
        score += 5;
      }
    });

    await supabase
      .from("users")
      .update({
        exam_score: score,
        exam_completed_at: new Date(),
      })
      .eq("id", userData.id);

    setSubmitted(true);
  };

  // LOADING
  if (loading) {
    return (
      <main className="p-6">
        <p>Loading exam...</p>
      </main>
    );
  }

  // NO EXAM
  if (!exam) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold">
          No Exam Available
        </h1>

        <p className="mt-2">
          Your cohort has not been assigned a released exam yet.
        </p>
      </main>
    );
  }

  // SUBMITTED
  if (submitted) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold text-green-600">
          Exam Submitted ✅
        </h1>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        {exam.title}
      </h1>

      {exam.questions.map((q: any, index: number) => (
        <div
          key={index}
          className="border p-4 rounded mb-4"
        >
          <p className="font-bold mb-2">
            Question {index + 1}
          </p>

          <p className="mb-3">
            {q.question_text}
          </p>

          <textarea
            className="border p-2 w-full"
            rows={4}
            placeholder="Your answer..."
            onChange={(e) => {
              const copy = [...answers];
              copy[index] = e.target.value;
              setAnswers(copy);
            }}
          />
        </div>
      ))}

      <button
        onClick={submitExam}
        className="bg-black text-white px-4 py-2"
      >
        Submit Exam
      </button>

    </main>
  );
}