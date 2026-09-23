"use client";

import React, { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTranslation } from "@/app/hooks/useTranslation";
import AuthForm from "./AuthForm";
import "./AuthModal.css";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Sign-in as a dialog over the current page.
 *
 * Signing in used to mean leaving for /auth, so someone who tapped "log in to
 * review" on a restaurant lost the restaurant. The dialog keeps the page behind
 * it and closes where the user was. Any component opens it with
 * `useAuth().openAuth()`; it is mounted once, in the root layout.
 */
export default function AuthModal() {
  const { authModal, openAuth, closeAuth, user } = useAuth();
  const { t } = useTranslation();
  const pathname = usePathname();
  const dialogRef = useRef<HTMLDivElement>(null);

  const open = authModal !== null && !user && !pathname.startsWith("/auth");

  // A route change (including the /auth page itself) or signing in closes it.
  useEffect(() => {
    if (authModal !== null && (user || pathname.startsWith("/auth"))) closeAuth();
  }, [authModal, user, pathname, closeAuth]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    // First field, not the close button: the user opened this to type.
    const dialog = dialogRef.current;
    const first = dialog?.querySelector<HTMLElement>("input") ?? dialog;
    first?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeAuth();
        return;
      }
      // Keep Tab inside the dialog while it is open.
      if (event.key !== "Tab" || !dialog) return;
      const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const head = items[0];
      const tail = items[items.length - 1];
      if (event.shiftKey && document.activeElement === head) {
        event.preventDefault();
        tail.focus();
      } else if (!event.shiftKey && document.activeElement === tail) {
        event.preventDefault();
        head.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, closeAuth]);

  if (!open) return null;

  const returnTo =
    typeof window !== "undefined"
      ? window.location.pathname + window.location.search
      : undefined;

  return (
    <div
      className="auth-modal__backdrop"
      onMouseDown={(event) => {
        // Only a press that starts on the backdrop closes it, so selecting
        // text in a field and releasing outside does not.
        if (event.target === event.currentTarget) closeAuth();
      }}
    >
      <div
        ref={dialogRef}
        className="auth-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-label={authModal === "register" ? t.authForm.tabRegister : t.authForm.tabLogin}
        tabIndex={-1}
      >
        <button
          type="button"
          className="auth-modal__close"
          onClick={closeAuth}
          aria-label={t.authForm.close}
        >
          <IoClose />
        </button>
        <AuthForm
          mode={authModal ?? "login"}
          onModeChange={(mode) => openAuth(mode)}
          onSuccess={closeAuth}
          returnTo={returnTo}
        />
      </div>
    </div>
  );
}
