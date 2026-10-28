import Link from "next/link";

// Replaces Next.js's bare default 404. Bilingual and static: it renders
// outside the providers that know the user's language.
export default function NotFound() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem 1rem",
        background: "#0f0f10",
        color: "#e4e4e7",
        textAlign: "center",
        fontFamily: "var(--font-ui)",
      }}
    >
      <div>
        <p style={{ fontSize: "3.5rem", margin: 0 }}>🍜</p>
        <h1 style={{ fontSize: "2rem", margin: "0.5rem 0", color: "#e9a004" }}>404</h1>
        <p style={{ margin: "0 0 0.25rem" }}>Không tìm thấy trang bạn cần.</p>
        <p style={{ margin: "0 0 1.5rem", opacity: 0.7 }}>This page could not be found.</p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            padding: "0.7rem 1.4rem",
            borderRadius: 999,
            background: "#e9a004",
            color: "#111",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Về trang chủ · Home
        </Link>
      </div>
    </main>
  );
}
