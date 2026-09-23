"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { FaArrowLeft, FaCheck } from "react-icons/fa";
import { useAuth, type AuthMode } from "@/app/contexts/AuthContext";
import { useTranslation } from "@/app/hooks/useTranslation";
import { getTopRestaurants, type Restaurant } from "@/app/lib/api";
import { isSafePath } from "@/app/lib/returnTo";
import AuthForm from "@/components/Auth/AuthForm";
import "./AuthPage.css";

const FALLBACK_IMAGE = "/assets/image/pho.png";

/**
 * The /auth page: a sign-in panel as the whole point of the page, on a moving
 * food photograph.
 *
 * The panel has two halves, a showcase and the form. Switching between
 * "Đăng nhập" and "Đăng ký" slides them past each other, which is the
 * signature of the original page. That page did it by keeping two complete
 * forms in the DOM and sliding one over the other, so the keyboard walked
 * through the hidden form; here there is one form, and only the halves move.
 * On a phone the halves stack and nothing slides.
 *
 * The cards floating in the showcase are real restaurants from the API, not
 * decoration made to look like data. If the API cannot be reached they are
 * simply not shown.
 */
const AuthPage: React.FC = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const { t } = useTranslation();
  const T = t.authForm;

  const [mode, setMode] = useState<AuthMode>("login");
  const [next, setNext] = useState("/");
  const [picks, setPicks] = useState<Restaurant[]>([]);

  /**
   * Read the query once on arrival: `?mode=register` from sign-up links,
   * `?next=` for where to go afterwards, and `?error=` from a failed Google
   * sign-in, which the backend sends back here.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") === "register") setMode("register");
    const target = params.get("next");
    if (isSafePath(target)) setNext(target);

    const code = params.get("error");
    if (!code) return;
    toast.error(code === "email_uses_password" ? T.errGooglePassword : T.errGoogleFailed, {
      duration: 7000,
    });
    // Drop the parameter so a refresh does not repeat the message.
    params.delete("error");
    const rest = params.toString();
    window.history.replaceState(null, "", window.location.pathname + (rest ? `?${rest}` : ""));
    // Runs once on arrival; the language at that moment is the right one.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    getTopRestaurants("diemTrungBinh", 3).then((rows) => {
      if (!cancelled) setPicks(rows.slice(0, 3));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Already signed in: nothing to do here.
  useEffect(() => {
    if (!isLoading && user) router.replace(next);
  }, [isLoading, user, router, next]);

  const isRegister = mode === "register";

  return (
    <div className="auth-scene">
      <div className="auth-scene__photo" aria-hidden="true" />
      <div className="auth-scene__glow auth-scene__glow--a" aria-hidden="true" />
      <div className="auth-scene__glow auth-scene__glow--b" aria-hidden="true" />

      <Link href="/" className="auth-scene__home">
        <FaArrowLeft aria-hidden="true" />
        <span>{T.backHome}</span>
      </Link>

      <div className={`auth-stage ${isRegister ? "is-register" : ""}`}>
        <aside className="auth-showcase">
          <div className="auth-showcase__inner">
            <Link href="/" className="auth-showcase__brand">
              <img src="/assets/image/logo-mark.png" alt="" width={34} height={34} />
              VietNomNom
            </Link>

            {/* Keyed so the copy fades in afresh when the mode changes. */}
            <div key={mode} className="auth-showcase__copy">
              <p className="auth-showcase__kicker">
                {isRegister ? T.showcaseRegisterKicker : T.showcaseLoginKicker}
              </p>
              <h1 className="auth-showcase__title">
                {isRegister ? T.showcaseRegisterTitle : T.showcaseLoginTitle}
              </h1>
              <p className="auth-showcase__text">
                {isRegister ? T.showcaseRegisterText : T.showcaseLoginText}
              </p>
              {isRegister && (
                <ul className="auth-showcase__perks">
                  {T.perks.map((perk) => (
                    <li key={perk}>
                      <FaCheck aria-hidden="true" />
                      {perk}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {!isRegister && picks.length > 0 && (
              <div className="auth-picks">
                <p className="auth-picks__label">{T.livePicks}</p>
                <ul className="auth-picks__list">
                  {picks.map((place, index) => (
                    <li
                      key={place._id}
                      className="auth-pick"
                      style={{ "--i": index } as React.CSSProperties}
                    >
                      <img
                        src={place.avatarUrl || FALLBACK_IMAGE}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(event) => {
                          const target = event.currentTarget;
                          if (!target.src.endsWith(FALLBACK_IMAGE)) target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <span className="auth-pick__name">{place.tenQuan}</span>
                      {/* A 0-10 score, as everywhere else on the site; no stars. */}
                      <span className="auth-pick__score">
                        {Number(place.diemTrungBinh ?? 0).toFixed(1)}
                      </span>
                      {place.reviewCount ? (
                        <span className="auth-pick__count">
                          {place.reviewCount} {T.reviewsWord}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="auth-showcase__tagline">{T.brandTagline}</p>
          </div>
        </aside>

        <section className="auth-panel">
          <AuthForm
            mode={mode}
            onModeChange={setMode}
            onSuccess={() => router.push(next)}
            returnTo={next}
          />
        </section>
      </div>
    </div>
  );
};

export default AuthPage;
