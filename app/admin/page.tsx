"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const ADMIN_EMAIL = "yournewemail@gmail.com"; // <- replace with your real admin email

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);

  const [title, setTitle] = useState("");
  const [question, setQuestion] = useState("");

  // LOAD USER
  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
    setLoading(false);
  };

  useEffect(() => {
    loadUser();
  }, []);

  // LOAD ADMIN DATA
  useEffect(() => {
    if (user?.email === ADMIN_EMAIL) {
      loadAll();
    }
  }, [user]);

  const loadAll = async () => {
    const { data: userData } = await supabase
      .from("users")
      .select("*");

    const { data: cohortData } = await supabase
      .from("cohorts")
      .select("*");

    const { data: examData } = await supabase
      .from("exams")
      .select("*");

    setUsers(userData || []);
    setCohorts(cohortData || []);
    setExams(examData || []);
  };

  // LOGIN
  const login = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    await loadUser();
  };

  // CREATE EXAM
  const createExam = async () => {
    await supabase.from("exams").insert({
      title,
      description: "Created by admin",
      time_limit_minutes: 30,
      questions: [
        {
          question_text: question,
          points: 5,
        },
      ],
    });

    setTitle("");
    setQuestion("");

    loadAll();
  };

  // ASSIGN EXAM TO COHORT
  const assignExam = async (
    examId: string,
    cohortId: string
  ) => {
    await supabase
      .from("cohorts")
      .update({
        assigned_exam_id: examId,
      })
      .eq("id", cohortId);

    loadAll();
  };

  // RELEASE EXAM
  const releaseExam = async (cohortId: string) => {
    await supabase
      .from("cohorts")
      .update({
        status: "testing",
        exam_released_at: new Date(),
      })
      .eq("id", cohortId);

    loadAll();
  };

  // LOADING
  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </main>
    );
  }

  // LOGIN PAGE
  if (!user) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <div className="border p-6 w-80 rounded">

          <h1 className="text-xl font-bold mb-4">
            Admin Login
          </h1>

          <input
            className="border p-2 w-full mb-2"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="border p-2 w-full mb-2"
            type="password"
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="bg-black text-white w-full p-2"
          >
            Login
          </button>

        </div>
      </main>
    );
  }

  // ACCESS DENIED
  if (user.email !== ADMIN_EMAIL) {
    return (
      <main className="flex items-center justify-center min-h-screen">
        <h1 className="text-red-600 font-bold text-xl">
          Access Denied 🚫
        </h1>
      </main>
    );
  }

  // ADMIN PANEL
  return (
    <main className="p-6 max-w-5xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Admin Panel ⚙️
      </h1>

      {/* USERS */}
      <div className="border p-4 rounded mb-6">
        <h2 className="font-bold text-lg mb-3">
          Users
        </h2>

        {users.map((u) => (
          <div
            key={u.id}
            className="border p-2 mb-2 rounded"
          >
            <p><b>Nickname:</b> {u.nickname}</p>
            <p><b>Email:</b> {u.email}</p>
            <p><b>Score:</b> {u.total_score}</p>
          </div>
        ))}
      </div>

      {/* COHORTS */}
      <div className="border p-4 rounded mb-6">
        <h2 className="font-bold text-lg mb-3">
          Cohorts
        </h2>

        {cohorts.map((c) => (
          <div
            key={c.id}
            className="border p-2 mb-2 rounded"
          >
            <p><b>ID:</b> {c.id}</p>
            <p><b>Status:</b> {c.status}</p>

            <button
              onClick={() => releaseExam(c.id)}
              className="bg-green-600 text-white px-3 py-1 mt-2"
            >
              Release Exam
            </button>
          </div>
        ))}
      </div>

      {/* CREATE EXAM */}
      <div className="border p-4 rounded mb-6">
        <h2 className="font-bold text-lg mb-3">
          Create Exam
        </h2>

        <input
          className="border p-2 w-full mb-2"
          placeholder="Exam title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          className="border p-2 w-full mb-2"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <button
          onClick={createExam}
          className="bg-black text-white px-4 py-2"
        >
          Create Exam
        </button>
      </div>

      {/* EXAMS */}
      <div className="border p-4 rounded">
        <h2 className="font-bold text-lg mb-3">
          Exams
        </h2>

        {exams.map((e) => (
          <div
            key={e.id}
            className="border p-2 mb-2 rounded"
          >
            <p><b>{e.title}</b></p>

            {cohorts.map((c) => (
              <button
                key={c.id}
                onClick={() => assignExam(e.id, c.id)}
                className="bg-blue-600 text-white px-2 py-1 mr-2 mt-2"
              >
                Assign to Cohort
              </button>
            ))}
          </div>
        ))}
      </div>

    </main>
  );
}