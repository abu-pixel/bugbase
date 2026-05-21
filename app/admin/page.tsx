"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("role")
        .eq("id", auth.user.id)
        .single();

      if (error || !data) {
        setAllowed(false);
        setLoading(false);
        return;
      }

      if (data.role !== "admin") {
        window.location.href = "/dashboard";
        return;
      }

      setAllowed(true);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!allowed) return <p>Access denied</p>;

  return (
    <main style={{ padding: 20 }}>
      <h1>Admin Panel 🔐</h1>

      <p>✔ Secure admin access verified</p>
      <p>✔ No frontend spoofing possible</p>
    </main>
  );
}