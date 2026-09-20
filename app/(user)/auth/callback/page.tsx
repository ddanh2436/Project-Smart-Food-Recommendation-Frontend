"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { getProfile, tokenStore } from "@/app/lib/api";
import { useTranslation } from "@/app/hooks/useTranslation";

/**
 * Landing page for the Google OAuth redirect.
 *
 * The backend now returns the tokens in the URL *fragment* (`#accessToken=...`)
 * rather than the query string. A query string is sent to the server, written
 * into access logs, kept in browser history and leaked via the Referer header;
 * a fragment never leaves the browser. This page reads it with
 * `window.location.hash` and then erases it from the address bar immediately, so
 * the tokens do not linger in history either.
 *
 * Because the fragment is client-only there is no `useSearchParams` here, so the
 * Suspense boundary the previous version needed is no longer required.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const { setUser } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  // StrictMode mounts effects twice in development; without this guard the
  // token exchange would run twice.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const hash = window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash;
    const params = new URLSearchParams(hash);

    const accessToken = params.get("accessToken");
    const refreshToken = params.get("refreshToken");

    if (!accessToken || !refreshToken) {
      setError(t.auth.callbackMissing);
      const timer = setTimeout(() => router.replace("/auth"), 1800);
      return () => clearTimeout(timer);
    }

    tokenStore.save(accessToken, refreshToken);

    // Replace the entry so the tokens are not left in the fragment or in the
    // back-button history.
    window.history.replaceState(null, "", window.location.pathname);

    getProfile()
      .then((profile) => {
        setUser(profile);
        router.replace("/");
      })
      .catch(() => {
        tokenStore.clear();
        setError(t.auth.callbackNoProfile);
        setTimeout(() => router.replace("/auth"), 1800);
      });
  }, [router, setUser, t]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 14,
        justifyContent: "center",
        alignItems: "center",
        minHeight: "70vh",
        padding: 24,
        textAlign: "center",
      }}
      role="status"
      aria-live="polite"
    >
      {error ? (
        <>
          <span style={{ fontSize: 40 }} aria-hidden="true">
            ⚠️
          </span>
          <h1 style={{ fontSize: "1.1rem", color: "#b91c1c", margin: 0 }}>
            {error}
          </h1>
        </>
      ) : (
        <>
          <span style={{ fontSize: 40 }} aria-hidden="true">
            🍜
          </span>
          <h1 style={{ fontSize: "1.1rem", margin: 0 }}>
            {t.auth.callbackSigningIn}
          </h1>
        </>
      )}
    </div>
  );
}
