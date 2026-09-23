"use client";

import React, { useId, useState } from "react";
import { toast } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { API_URL, describeError, getProfile, login, register } from "@/app/lib/api";
import { rememberReturnTo } from "@/app/lib/returnTo";
import { useAuth, type AuthMode } from "@/app/contexts/AuthContext";
import { useTranslation } from "@/app/hooks/useTranslation";
import "./AuthForm.css";

/**
 * Google sign-in is a full-page navigation to the API, not an XHR, so it needs
 * the deployed base URL spelled out (a hard-coded localhost here once sent the
 * live site to a server that was not running).
 */
const GOOGLE_SIGN_IN_URL = `${API_URL}/auth/google`;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// The API's own rules (CreateUserDto), checked here so a mistake is shown as
// the user types rather than as a server error after submitting.
const USERNAME_RE = /^[\w.-]{3,30}$/;
const MIN_PASSWORD = 8;

type Field = "username" | "email" | "password";

/** 0 = too short, 1 = weak, 2 = fair, 3 = strong. */
function passwordStrength(password: string): number {
  if (password.length < MIN_PASSWORD) return 0;
  const traits = [
    password.length >= 12,
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /\d/.test(password),
    /[^\w\s]/.test(password),
  ].filter(Boolean).length;
  return traits >= 3 ? 3 : traits >= 1 ? 2 : 1;
}

/**
 * The sign-in and sign-up form, shared by the dialog and the /auth page.
 *
 * One form with two tabs replaced two forms behind a sliding panel. The slider
 * kept both forms in the DOM, so keyboard focus walked through the hidden one,
 * and it had no layout below tablet width. Username, email and password are
 * the fields the API needs; the confirm-password box is gone now that the
 * password can be shown.
 */
export default function AuthForm({
  mode,
  onModeChange,
  onSuccess,
  returnTo,
}: {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  /** Called after the session is established and the profile loaded. */
  onSuccess: () => void;
  /** Page to come back to after Google sign-in, which leaves the site. */
  returnTo?: string;
}) {
  const { setUser } = useAuth();
  const { t } = useTranslation();
  const T = t.authForm;
  const id = useId();

  const [values, setValues] = useState({ username: "", email: "", password: "" });
  // Errors appear once a field has been left, not on the first keystroke.
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const isRegister = mode === "register";

  const validate = (field: Field): string | null => {
    const value = values[field];
    if (field === "username") {
      if (!isRegister) return null;
      if (!value.trim()) return T.errUsername;
      return USERNAME_RE.test(value) ? null : T.errUsernameFormat;
    }
    if (field === "email") {
      if (!value.trim()) return T.errEmail;
      return EMAIL_RE.test(value.trim()) ? null : T.errInvalidEmail;
    }
    if (!value) return T.errPassword;
    // Login is not length-checked: accounts made under an older, shorter
    // rule must still be able to sign in.
    return isRegister && value.length < MIN_PASSWORD ? T.errPasswordLength : null;
  };

  const fields: Field[] = isRegister ? ["username", "email", "password"] : ["email", "password"];
  const errorOf = (field: Field) => (touched[field] ? validate(field) : null);

  const update = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setApiError(null);
  };

  const switchMode = (next: AuthMode) => {
    if (next === mode) return;
    // Keep what was typed: someone who picked the wrong tab should not have
    // to type their email again.
    setTouched({});
    setApiError(null);
    onModeChange(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ username: true, email: true, password: true });
    if (fields.some((field) => validate(field))) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const email = values.email.trim();
      if (isRegister) {
        await register(values.username.trim(), email, values.password);
      } else {
        await login(email, values.password);
      }
      setUser(await getProfile());
      toast.success(isRegister ? T.successRegister : T.successLogin);
      onSuccess();
    } catch (error: unknown) {
      setApiError(describeError(error));
    } finally {
      setSubmitting(false);
    }
  };

  const strength = passwordStrength(values.password);

  return (
    <div className="auth-form">
      <div className="auth-form__brand">
        <span className="auth-form__logo" aria-hidden="true">🍜</span>
        <span className="auth-form__name">VietNomNom</span>
      </div>
      <p className="auth-form__tagline">{T.brandTagline}</p>

      <div className="auth-form__tabs" role="tablist" aria-label="VietNomNom">
        {(["login", "register"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            id={`${id}-tab-${tab}`}
            aria-selected={mode === tab}
            aria-controls={`${id}-panel`}
            className={`auth-form__tab ${mode === tab ? "is-active" : ""}`}
            onClick={() => switchMode(tab)}
          >
            {tab === "login" ? T.tabLogin : T.tabRegister}
          </button>
        ))}
      </div>

      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${mode}`}>
        <p className="auth-form__lead">{isRegister ? T.registerLead : T.loginLead}</p>

        {/* Google's own wording and mark, per its sign-in branding rules. */}
        <a
          href={GOOGLE_SIGN_IN_URL}
          className="auth-form__google"
          onClick={() => returnTo && rememberReturnTo(returnTo)}
        >
          <FcGoogle aria-hidden="true" className="auth-form__google-icon" />
          <span>{T.google}</span>
        </a>

        <div className="auth-form__divider" role="separator">
          <span>{T.divider}</span>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {isRegister && (
            <div className="auth-field">
              <label htmlFor={`${id}-username`}>{T.username}</label>
              <input
                id={`${id}-username`}
                name="username"
                autoComplete="username"
                value={values.username}
                onChange={update("username")}
                onBlur={() => setTouched((c) => ({ ...c, username: true }))}
                aria-invalid={!!errorOf("username")}
                aria-describedby={`${id}-username-hint`}
                disabled={submitting}
                maxLength={30}
              />
              <p
                id={`${id}-username-hint`}
                className={errorOf("username") ? "auth-field__error" : "auth-field__hint"}
              >
                {errorOf("username") ?? T.usernameHint}
              </p>
            </div>
          )}

          <div className="auth-field">
            <label htmlFor={`${id}-email`}>{T.email}</label>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="ban@example.com"
              value={values.email}
              onChange={update("email")}
              onBlur={() => setTouched((c) => ({ ...c, email: true }))}
              aria-invalid={!!errorOf("email")}
              aria-describedby={`${id}-email-error`}
              disabled={submitting}
            />
            {errorOf("email") && (
              <p id={`${id}-email-error`} className="auth-field__error">
                {errorOf("email")}
              </p>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor={`${id}-password`}>{T.password}</label>
            <div className="auth-field__password">
              <input
                id={`${id}-password`}
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={isRegister ? "new-password" : "current-password"}
                value={values.password}
                onChange={update("password")}
                onBlur={() => setTouched((c) => ({ ...c, password: true }))}
                aria-invalid={!!errorOf("password")}
                aria-describedby={`${id}-password-note`}
                disabled={submitting}
                maxLength={128}
              />
              <button
                type="button"
                className="auth-field__reveal"
                onClick={() => setShowPassword((shown) => !shown)}
                aria-label={showPassword ? T.hidePassword : T.showPassword}
                aria-pressed={showPassword}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div id={`${id}-password-note`}>
              {errorOf("password") && (
                <p className="auth-field__error">{errorOf("password")}</p>
              )}
              {isRegister && values.password && (
                <div className="auth-strength" aria-live="polite">
                  <div className="auth-strength__bars" aria-hidden="true">
                    {[1, 2, 3].map((level) => (
                      <span
                        key={level}
                        className={strength >= level ? `is-on level-${strength}` : ""}
                      />
                    ))}
                  </div>
                  <span className="auth-strength__label">
                    {T.strengthLabel}: {T.strength[strength]}
                  </span>
                </div>
              )}
            </div>
          </div>

          {apiError && (
            <p className="auth-form__api-error" role="alert">
              {apiError}
            </p>
          )}

          <button type="submit" className="auth-form__submit" disabled={submitting}>
            {submitting ? T.submitting : isRegister ? T.submitRegister : T.submitLogin}
          </button>
        </form>

        <p className="auth-form__switch">
          {isRegister ? T.switchToLogin : T.switchToRegister}{" "}
          <button type="button" onClick={() => switchMode(isRegister ? "login" : "register")}>
            {isRegister ? T.switchToLoginLink : T.switchToRegisterLink}
          </button>
        </p>
      </div>
    </div>
  );
}
