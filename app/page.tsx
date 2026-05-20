import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      padding: 40,
      display: "flex",
      flexDirection: "column",
      gap: 16,
      fontFamily: "Arial"
    }}>
      <h1>BugBase is Live 🚀</h1>

      <Link href="/signup" style={{ color: "blue", textDecoration: "underline" }}>
        Go to Signup
      </Link>

      <Link href="/login" style={{ color: "blue", textDecoration: "underline" }}>
        Go to Login
      </Link>
    </main>
  );
}