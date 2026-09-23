"use client";

import React, { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  FaBookmark,
  FaCamera,
  FaHeart,
  FaLock,
  FaSignOutAlt,
  FaStar,
  FaUser,
  FaUtensils,
} from "react-icons/fa";
import { useAuth } from "@/app/contexts/AuthContext";
import { useTranslation } from "@/app/hooks/useTranslation";
import {
  changePassword,
  deleteMyReview,
  describeError,
  getMyReviews,
  getRestaurantById,
  getSavedIds,
  logout,
  toggleSaved,
  updateProfile,
  type MyReview,
  type Restaurant,
} from "@/app/lib/api";
import { formatRating } from "@/app/lib/rating";
import { authHref } from "@/app/lib/returnTo";
import { MAX_TASTES, TASTE_TAGS, dinerLevel } from "@/app/lib/tastes";
import { tagLabel } from "@/app/lib/restaurant";
import "./ProfilePage.css";

type Tab = "profile" | "saved" | "reviews" | "tastes" | "security";
const TABS: { key: Tab; icon: React.ReactNode }[] = [
  { key: "profile", icon: <FaUser /> },
  { key: "saved", icon: <FaBookmark /> },
  { key: "reviews", icon: <FaStar /> },
  { key: "tastes", icon: <FaHeart /> },
  { key: "security", icon: <FaLock /> },
];
const CITIES = ["hanoi", "hcmc", "danang"];
const FALLBACK_IMAGE = "/assets/image/pho.png";
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/**
 * Shrink a chosen photo to a 256px square JPEG data URL (about 30 KB).
 *
 * Stored inline on the account, so there is no file storage to pay for; the
 * API refuses anything but PNG, JPEG and WebP data URLs, and SVG in particular.
 */
function toAvatarDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      const size = 256;
      const side = Math.min(img.width, img.height);
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      ctx.drawImage(
        img,
        (img.width - side) / 2,
        (img.height - side) / 2,
        side,
        side,
        0,
        0,
        size,
        size,
      );
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

/**
 * The diner's own page.
 *
 * It was an HR-style settings form on a white card — first/last name,
 * company, job title — cut off from the rest of the site with only a back
 * arrow. It is now the site's dark theme under the site's header, with the
 * things a diner has here: their details, the places they saved, the reviews
 * they wrote, their tastes, and their password.
 */
function ProfileContent() {
  const { user, setUser, isLoading } = useAuth();
  const { t, lang } = useTranslation();
  const P = t.profile;
  const router = useRouter();
  const searchParams = useSearchParams();

  const requested = searchParams.get("tab") as Tab | null;
  const tab: Tab = TABS.some((item) => item.key === requested) ? (requested as Tab) : "profile";
  const setTab = (next: Tab) =>
    router.replace(next === "profile" ? "/profile" : `/profile?tab=${next}`, { scroll: false });

  const [reviews, setReviews] = useState<MyReview[] | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error(P.loginRequired);
      router.replace(authHref("/profile"));
    }
  }, [isLoading, user, router, P.loginRequired]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getMyReviews()
      .then((rows) => !cancelled && setReviews(rows))
      .catch(() => !cancelled && setReviews([]));
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (isLoading || !user) {
    return <div className="pf-loading">{P.loading}</div>;
  }

  const handleLogout = async () => {
    await logout();
    setUser(null);
    toast.success(t.auth.logoutSuccess);
    router.push("/");
  };

  return (
    <div className="pf">
      <div className="pf-head">
        <h1>{P.title}</h1>
        <p>{P.subtitle}</p>
      </div>

      <div className="pf-grid">
        <aside className="pf-side">
          <IdentityCard reviewCount={reviews?.length ?? 0} />
          <nav className="pf-nav" aria-label={P.title}>
            {TABS.map(({ key, icon }) => (
              <button
                key={key}
                type="button"
                className={`pf-nav__item ${tab === key ? "is-active" : ""}`}
                aria-current={tab === key ? "page" : undefined}
                onClick={() => setTab(key)}
              >
                <span className="pf-nav__icon" aria-hidden="true">{icon}</span>
                {P.tabs[key]}
                {key === "reviews" && reviews ? (
                  <span className="pf-nav__count">{reviews.length}</span>
                ) : null}
              </button>
            ))}
            <button type="button" className="pf-nav__item pf-nav__logout" onClick={handleLogout}>
              <span className="pf-nav__icon" aria-hidden="true"><FaSignOutAlt /></span>
              {P.logout}
            </button>
          </nav>
        </aside>

        <section className="pf-main" key={tab}>
          {tab === "profile" && <DetailsTab />}
          {tab === "saved" && <SavedTab />}
          {tab === "reviews" && (
            <ReviewsTab
              reviews={reviews}
              onDeleted={(id) => setReviews((rows) => rows?.filter((r) => r._id !== id) ?? rows)}
            />
          )}
          {tab === "tastes" && <TastesTab lang={lang} />}
          {tab === "security" && <SecurityTab />}
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Identity card: photo, name, level
// ---------------------------------------------------------------------------
function IdentityCard({ reviewCount }: { reviewCount: number }) {
  const { user, setUser } = useAuth();
  const { t, lang } = useTranslation();
  const P = t.profile;
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  if (!user) return null;

  const name = user.fullName?.trim() || [user.lastName, user.firstName].filter(Boolean).join(" ") || user.username;
  const level = dinerLevel(reviewCount);
  const since = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(lang === "en" ? "en-GB" : "vi-VN", {
        month: "long",
        year: "numeric",
      })
    : null;

  const pick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      toast.error(P.photoType);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error(P.photoTooBig);
      return;
    }
    setUploading(true);
    try {
      const picture = await toAvatarDataUrl(file);
      setUser(await updateProfile({ picture }));
      toast.success(P.photoSaved);
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setUploading(false);
    }
  };

  const remove = async () => {
    setUploading(true);
    try {
      setUser(await updateProfile({ picture: "" }));
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="pf-card">
      <button
        type="button"
        className="pf-avatar"
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        aria-label={P.changePhoto}
        title={P.changePhoto}
      >
        {user.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.picture} alt="" referrerPolicy="no-referrer" />
        ) : (
          <span className="pf-avatar__letter">{name.charAt(0).toUpperCase()}</span>
        )}
        <span className="pf-avatar__overlay" aria-hidden="true">
          {uploading ? <span className="pf-spinner" /> : <FaCamera />}
        </span>
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={pick}
      />
      {user.picture && (
        <button type="button" className="pf-link" onClick={remove} disabled={uploading}>
          {P.removePhoto}
        </button>
      )}

      <h2 className="pf-card__name">{name}</h2>
      <p className="pf-card__handle">@{user.username}</p>

      <span className={`pf-level pf-level--${level}`} title={P.levelHint}>
        <FaUtensils aria-hidden="true" /> {P.levels[level]}
      </span>

      <ul className="pf-card__facts">
        {user.homeCity && P.cities[user.homeCity] && <li>📍 {P.cities[user.homeCity]}</li>}
        {since && (
          <li>
            🗓 {P.memberSince} {since}
          </li>
        )}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Personal details
// ---------------------------------------------------------------------------
function DetailsTab() {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const P = t.profile;

  const initial = useMemo(
    () => ({
      fullName:
        user?.fullName ?? [user?.lastName, user?.firstName].filter(Boolean).join(" ") ?? "",
      homeCity: user?.homeCity ?? "",
      bio: user?.bio ?? "",
    }),
    [user],
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);

  const dirty =
    form.fullName !== initial.fullName || form.homeCity !== initial.homeCity || form.bio !== initial.bio;

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      setUser(await updateProfile({ ...form, fullName: form.fullName.trim() }));
      toast.success(P.saved_ok);
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;
  return (
    <form className="pf-panel" onSubmit={save}>
      <h2 className="pf-panel__title">{P.tabs.profile}</h2>

      <div className="pf-field">
        <label htmlFor="pf-fullname">{P.fullName}</label>
        <input
          id="pf-fullname"
          value={form.fullName}
          maxLength={60}
          placeholder={P.fullNamePlaceholder}
          autoComplete="name"
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
        />
      </div>

      <div className="pf-row">
        <div className="pf-field">
          <label htmlFor="pf-username">{P.usernameLabel}</label>
          <input id="pf-username" value={user.username} readOnly className="is-locked" />
        </div>
        <div className="pf-field">
          <label htmlFor="pf-email">{P.email}</label>
          <div className="pf-locked">
            <input id="pf-email" value={user.email} readOnly className="is-locked" aria-describedby="pf-email-note" />
            <FaLock aria-hidden="true" />
          </div>
          <p id="pf-email-note" className="pf-note">{P.emailLocked}</p>
        </div>
      </div>

      <div className="pf-field">
        <label htmlFor="pf-city">{P.homeCity}</label>
        <select
          id="pf-city"
          value={form.homeCity}
          onChange={(e) => setForm({ ...form, homeCity: e.target.value })}
        >
          <option value="">{P.homeCityNone}</option>
          {CITIES.map((city) => (
            <option key={city} value={city}>
              {P.cities[city]}
            </option>
          ))}
        </select>
      </div>

      <div className="pf-field">
        <label htmlFor="pf-bio">{P.bio}</label>
        <textarea
          id="pf-bio"
          rows={4}
          maxLength={300}
          value={form.bio}
          placeholder={P.bioPlaceholder}
          onChange={(e) => setForm({ ...form, bio: e.target.value })}
        />
        <p className="pf-note pf-note--right">{form.bio.length}/300</p>
      </div>

      {/* Stays in view while there is something to save. */}
      <div className={`pf-actions ${dirty ? "is-dirty" : ""}`}>
        {dirty && <span className="pf-actions__hint">{P.unsaved}</span>}
        <button type="button" className="pf-btn pf-btn--ghost" disabled={!dirty || saving} onClick={() => setForm(initial)}>
          {P.cancel}
        </button>
        <button type="submit" className="pf-btn pf-btn--primary" disabled={!dirty || saving}>
          {saving ? P.saving : P.save}
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Saved places (kept in this browser; see getSavedIds)
// ---------------------------------------------------------------------------
function SavedTab() {
  const { t } = useTranslation();
  const P = t.profile;
  const [places, setPlaces] = useState<Restaurant[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const ids = getSavedIds().slice(0, 40);
    Promise.allSettled(ids.map((id) => getRestaurantById(id))).then((results) => {
      if (cancelled) return;
      setPlaces(
        results
          .filter((r): r is PromiseFulfilledResult<Restaurant> => r.status === "fulfilled")
          .map((r) => r.value),
      );
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const unsave = (id: string) => {
    toggleSaved(id);
    setPlaces((rows) => rows?.filter((row) => row._id !== id) ?? rows);
  };

  return (
    <div className="pf-panel">
      <h2 className="pf-panel__title">{P.tabs.saved}</h2>
      <p className="pf-note">{P.savedNote}</p>
      {places === null ? (
        <SkeletonGrid />
      ) : places.length === 0 ? (
        <Empty text={P.savedEmpty} />
      ) : (
        <ul className="pf-places">
          {places.map((place) => (
            <li key={place._id} className="pf-place">
              <Link href={`/restaurants/${place._id}`} className="pf-place__link">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={place.avatarUrl || FALLBACK_IMAGE} alt="" loading="lazy" referrerPolicy="no-referrer" />
                <span className="pf-place__score">{formatRating(place.diemTrungBinh)}</span>
                <span className="pf-place__name">{place.tenQuan}</span>
                <span className="pf-place__addr">{place.diaChi}</span>
              </Link>
              <button type="button" className="pf-place__remove" onClick={() => unsave(place._id)}>
                {P.unsave}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// My reviews
// ---------------------------------------------------------------------------
function ReviewsTab({
  reviews,
  onDeleted,
}: {
  reviews: MyReview[] | null;
  onDeleted: (id: string) => void;
}) {
  const { t, lang } = useTranslation();
  const P = t.profile;

  const remove = async (id: string) => {
    if (!window.confirm(P.deleteConfirm)) return;
    try {
      await deleteMyReview(id);
      onDeleted(id);
      toast.success(P.reviewDeleted);
    } catch (error) {
      toast.error(describeError(error));
    }
  };

  return (
    <div className="pf-panel">
      <h2 className="pf-panel__title">{P.tabs.reviews}</h2>
      {reviews === null ? (
        <SkeletonGrid />
      ) : reviews.length === 0 ? (
        <Empty text={P.reviewsEmpty} />
      ) : (
        <ul className="pf-reviews">
          {reviews.map((review) => (
            <li key={review._id} className="pf-review">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={review.restaurantImage || FALLBACK_IMAGE} alt="" loading="lazy" referrerPolicy="no-referrer" />
              <div className="pf-review__body">
                <div className="pf-review__head">
                  {review.restaurantId ? (
                    <Link href={`/restaurants/${review.restaurantId}`}>{review.tenQuan}</Link>
                  ) : (
                    <span>{review.tenQuan}</span>
                  )}
                  <span className="pf-review__score">{formatRating(review.diemReview)}/10</span>
                </div>
                <p className="pf-review__text">{review.noiDung}</p>
                <div className="pf-review__foot">
                  {review.createdAt && (
                    <time dateTime={review.createdAt}>
                      {new Date(review.createdAt).toLocaleDateString(lang === "en" ? "en-GB" : "vi-VN")}
                    </time>
                  )}
                  <button type="button" className="pf-link pf-link--danger" onClick={() => remove(review._id)}>
                    {P.deleteReview}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tastes
// ---------------------------------------------------------------------------
function TastesTab({ lang }: { lang: "vi" | "en" }) {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  const P = t.profile;
  const initial = useMemo(() => user?.favoriteTags ?? [], [user]);
  const [chosen, setChosen] = useState<string[]>(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setChosen(initial), [initial]);

  const dirty = chosen.length !== initial.length || chosen.some((tag) => !initial.includes(tag));

  const toggle = (tag: string) => {
    setChosen((current) => {
      if (current.includes(tag)) return current.filter((item) => item !== tag);
      if (current.length >= MAX_TASTES) {
        toast.error(P.tastesLimit);
        return current;
      }
      return [...current, tag];
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      setUser(await updateProfile({ favoriteTags: chosen }));
      toast.success(P.saved_ok);
    } catch (error) {
      toast.error(describeError(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pf-panel">
      <h2 className="pf-panel__title">{P.tastesTitle}</h2>
      <p className="pf-note">{P.tastesHint}</p>
      <div className="pf-tastes" role="group" aria-label={P.tastesTitle}>
        {TASTE_TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`pf-taste ${chosen.includes(tag) ? "is-on" : ""}`}
            aria-pressed={chosen.includes(tag)}
            onClick={() => toggle(tag)}
          >
            {tagLabel(tag, lang)}
          </button>
        ))}
      </div>
      <div className={`pf-actions ${dirty ? "is-dirty" : ""}`}>
        <span className="pf-actions__hint">
          {chosen.length}/{MAX_TASTES}
        </span>
        <button type="button" className="pf-btn pf-btn--ghost" disabled={!dirty || saving} onClick={() => setChosen(initial)}>
          {P.cancel}
        </button>
        <button type="button" className="pf-btn pf-btn--primary" disabled={!dirty || saving} onClick={save}>
          {saving ? P.saving : P.save}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Security
// ---------------------------------------------------------------------------
function SecurityTab() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const P = t.profile;
  const [form, setForm] = useState({ current: "", next: "", repeat: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setError(null);
      if (form.next.length < 8) return setError(P.passwordShort);
      if (form.next !== form.repeat) return setError(P.passwordMismatch);
      setSaving(true);
      try {
        await changePassword(form.current, form.next);
        setForm({ current: "", next: "", repeat: "" });
        toast.success(P.passwordChanged);
      } catch (err) {
        setError(describeError(err));
      } finally {
        setSaving(false);
      }
    },
    [form, P],
  );

  if (user?.provider === "google") {
    return (
      <div className="pf-panel">
        <h2 className="pf-panel__title">{P.securityTitle}</h2>
        <Empty text={P.googleAccount} />
      </div>
    );
  }

  return (
    <form className="pf-panel" onSubmit={submit}>
      <h2 className="pf-panel__title">{P.securityTitle}</h2>
      <p className="pf-note">{P.passwordNote}</p>
      {(
        [
          ["current", P.currentPassword, "current-password"],
          ["next", P.newPassword, "new-password"],
          ["repeat", P.confirmPassword, "new-password"],
        ] as const
      ).map(([key, label, autoComplete]) => (
        <div className="pf-field" key={key}>
          <label htmlFor={`pf-pw-${key}`}>{label}</label>
          <input
            id={`pf-pw-${key}`}
            type="password"
            autoComplete={autoComplete}
            maxLength={128}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            required
          />
        </div>
      ))}
      {error && (
        <p className="pf-error" role="alert">
          {error}
        </p>
      )}
      <div className="pf-actions">
        <button type="submit" className="pf-btn pf-btn--primary" disabled={saving || !form.current || !form.next}>
          {saving ? P.saving : P.changePassword}
        </button>
      </div>
    </form>
  );
}

function Empty({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <div className="pf-empty">
      <p>{text}</p>
      <Link href="/restaurants" className="pf-btn pf-btn--ghost">
        {t.profile.browse}
      </Link>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="pf-skeletons" aria-busy="true">
      {[0, 1, 2].map((index) => (
        <div key={index} className="pf-skeleton" />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="pf-loading" />}>
      <ProfileContent />
    </Suspense>
  );
}
