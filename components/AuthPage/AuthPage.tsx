"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAuth, type AuthMode } from "@/app/contexts/AuthContext";
import { useTranslation } from "@/app/hooks/useTranslation";
import AuthForm from "@/components/Auth/AuthForm";
import "./AuthPage.css";

/**
 * The /auth page: the same form as the sign-in dialog, on a page of its own.
 *
 * Most sign-ins now happen in the dialog. This page stays because Google
 * sign-in is a full-page round trip, and the backend sends a failed one back
 * here with `?error=...`; it is also where a shared or bookmarked link lands.
 */
const AuthForm_Page: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>("login");

  /**
   * Errors handed back by the Google callback as `?error=...`, and
   * `?mode=register` from links that mean "sign up".
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "register") setMode("register");

    const code = params.get("error");
    if (!code) return;
    toast.error(
      code === "email_uses_password" ? t.authForm.errGooglePassword : t.authForm.errGoogleFailed,
      { duration: 7000 },
    );
    // Drop the parameter so a refresh does not repeat the message.
    params.delete("error");
    const rest = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : ""));
    // Runs once on arrival; the language at that moment is the right one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Already signed in: nothing to do here.
  useEffect(() => {
    if (!isLoading && user) router.replace("/");
  }, [isLoading, user, router]);

  return (
    <div className="auth-page">
      <Link href="/" className="auth-page__home" aria-label="VietNomNom">
        ← VietNomNom
      </Link>
      <div className="auth-page__card">
        <AuthForm mode={mode} onModeChange={setMode} onSuccess={() => router.push("/")} />
      </div>
    </div>
  );
};

export default AuthForm_Page;
