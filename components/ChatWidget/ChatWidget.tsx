"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaPaperPlane,
  FaComments,
  FaMapMarkerAlt,
  FaImage,
  FaSpinner,
  FaTimes,
  FaArrowDown,
  FaLocationArrow,
  FaRedo,
  FaTrash,
} from "react-icons/fa";
import { chatSuggestions, useChatSession } from "@/app/hooks/useChatSession";
import { formatReviewCount } from "@/app/lib/rating";
import { ScoreBadge } from "@/components/Score/Score";
import ResultReasons from "./ResultReasons";

/** Render **bold** segments without pulling in a markdown dependency. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("**").map((part, index) =>
        index % 2 === 1 ? (
          <strong key={index} className="font-semibold text-amber-400">
            {part}
          </strong>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

/** The brand mark, used instead of a generic robot glyph. */
function BrandAvatar({ size = 40 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-500/30 bg-stone-900"
      style={{ width: size, height: size }}
    >
      <Image
        src="/assets/image/logo-mark.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain p-1"
      />
    </span>
  );
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const [unread, setUnread] = useState(0);

  // Conversation state lives in a shared hook so the floating widget and the
  // full chat page cannot drift apart.
  const {
    t,
    lang,
    messages,
    loading,
    coords,
    geoStatus,
    send: sendMessage,
    sendImage,
    enableLocationAndRetry,
    reset,
  } = useChatSession();

  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Vietnamese input goes through an IME; Enter during composition selects a
  // candidate and must not send the message.
  const composingRef = useRef(false);

  // --- scrolling ---------------------------------------------------------
  // Only follow new messages when the user is already at the bottom. Scrolling
  // unconditionally yanked the view away while they were reading earlier
  // results.
  useEffect(() => {
    if (!isOpen) return;
    if (atBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    } else {
      setUnread((n) => n + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setAtBottom(near);
    if (near) setUnread(0);
  };

  const jumpToLatest = () => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    setUnread(0);
    setAtBottom(true);
  };

  // --- open / close ------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 250);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // --- sending -----------------------------------------------------------
  const send = (text: string) => {
    if (!text.trim() || loading) return;
    setInput("");
    setAtBottom(true);
    void sendMessage(text);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAtBottom(true);
      void sendImage(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearChat = () => {
    reset();
    setUnread(0);
    setAtBottom(true);
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Launcher — the only chat affordance on screen until it is opened, */}
      {/* so the hero keeps a single obvious entry point (the search bar).  */}
      {/* ---------------------------------------------------------------- */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label={t.chat.openLabel}
        className={`group fixed bottom-6 right-6 z-[9998] flex h-14 w-14 items-center justify-center rounded-full border border-amber-300/30 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-950/40 transition duration-300 hover:scale-105 hover:shadow-orange-600/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 active:scale-95 motion-reduce:transition-none sm:h-16 sm:w-16 ${
          isOpen
            ? "pointer-events-none scale-0 opacity-0"
            : "scale-100 opacity-100"
        }`}
      >
        <FaComments size={26} />
        <span className="pointer-events-none absolute right-[4.5rem] hidden whitespace-nowrap rounded-lg border border-stone-700 bg-stone-900 px-3 py-1.5 text-xs font-semibold text-amber-400 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 sm:block">
          {t.chat.bubble}
        </span>
      </button>

      {/* Backdrop, phone only: the panel covers the screen there. */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9998] bg-black/60 backdrop-blur-sm sm:hidden"
          aria-hidden="true"
        />
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Panel                                                             */}
      {/*                                                                   */}
      {/* Anchored 24px from the bottom-right corner and capped so it can   */}
      {/* never reach the navbar: it used to float up the right-hand side   */}
      {/* and cover the hero.                                               */}
      {/* ---------------------------------------------------------------- */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label={t.chat.ariaWindow}
        className={`fixed z-[9999] flex flex-col overflow-hidden border border-stone-800 bg-stone-950 shadow-2xl shadow-black/70 transition-all duration-300 ease-out motion-reduce:transition-none
          inset-x-0 bottom-0 top-0 rounded-none
          sm:inset-auto sm:bottom-6 sm:right-6 sm:top-auto sm:h-[min(600px,calc(100vh-10rem))] sm:w-[396px] sm:rounded-2xl
          ${
            isOpen
              ? "pointer-events-auto translate-y-0 opacity-100 sm:scale-100"
              : "pointer-events-none translate-y-6 opacity-0 sm:scale-95"
          }`}
      >
        {/* -------- Header -------- */}
        <header className="relative flex shrink-0 items-center justify-between gap-2 border-b border-amber-500/10 bg-gradient-to-r from-stone-900 to-stone-900/80 px-4 py-3">
          <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-amber-600/10 blur-3xl" />

          <div className="relative z-10 flex min-w-0 items-center gap-3">
            <BrandAvatar size={40} />
            <div className="min-w-0">
              <h2 className="truncate text-[15px] font-bold tracking-wide text-stone-50">
                NomNom Assistant
              </h2>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {coords ? t.chat.knowsLocation : t.chat.ready}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1">
            <button
              onClick={clearChat}
              aria-label={t.chat.resetLabel}
              title={t.chat.resetLabel}
              className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white/5 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <FaTrash size={13} />
            </button>
            {/* A close cross, not a chevron: a downward arrow reads as a
                scroll control rather than "dismiss". */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label={t.chat.closeLabel}
              title={t.common.closeLabel}
              className="rounded-full p-2 text-stone-400 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <FaTimes size={15} />
            </button>
          </div>
        </header>

        {/* -------- Messages -------- */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          className="relative flex-1 space-y-4 overflow-y-auto bg-stone-950 px-4 py-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full gap-2 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && <BrandAvatar size={30} />}

              <div
                className={`flex max-w-[86%] flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt={t.chat.sentImageAlt}
                    className="mb-2 h-32 w-32 rounded-xl border border-amber-500/30 object-cover"
                  />
                )}

                {/* Bot bubbles carry a warm bronze tint rather than the cool
                    slate that clashed with the site palette. */}
                <div
                  className={`whitespace-pre-line px-4 py-2.5 text-[14px] leading-relaxed ${
                    msg.sender === "user"
                      ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                      : "rounded-2xl rounded-tl-sm border border-amber-900/40 bg-stone-900 text-stone-200"
                  }`}
                >
                  <RichText text={msg.text} />
                </div>

                {msg.kind === "need_location" && !coords && (
                  <button
                    onClick={enableLocationAndRetry}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[13px] font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                  >
                    <FaLocationArrow size={12} />
                    {geoStatus === "denied"
                      ? t.chat.reallowLocation
                      : t.chat.allowLocation}
                  </button>
                )}

                {msg.failedQuery && (
                  <button
                    onClick={() => send(msg.failedQuery!)}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-900 px-3 py-2 text-[13px] font-semibold text-stone-300 transition-colors hover:border-amber-500/40 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                  >
                    <FaRedo size={11} /> {t.common.retry}
                  </button>
                )}

                {/* -------- Result cards -------- */}
                {msg.results && msg.results.length > 0 && (
                  <ul className="mt-3 w-full space-y-2">
                    {msg.results.map((item) => {
                      const reviews = formatReviewCount(item.reviewCount, lang);
                      return (
                        <li key={item._id}>
                          <Link
                            href={`/restaurants/${item._id}`}
                            className="group flex h-[84px] overflow-hidden rounded-xl border border-stone-800 bg-stone-900/70 transition-colors hover:border-amber-500/40 hover:bg-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                          >
                            <div className="relative h-full w-[84px] shrink-0 overflow-hidden">
                              <img
                                src={item.avatarUrl || "/assets/image/pho.png"}
                                alt=""
                                referrerPolicy="no-referrer"
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
                                onError={(event) => {
                                  const target =
                                    event.target as HTMLImageElement;
                                  if (
                                    !target.src.includes("/assets/image/pho.png")
                                  ) {
                                    target.src = "/assets/image/pho.png";
                                  }
                                }}
                              />
                              {/* One badge only, so the food stays visible. */}
                              <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm">
                                <ScoreBadge score={item.diemTrungBinh} withScale />
                              </span>
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5">
                              <div className="min-w-0">
                                <h3 className="line-clamp-2 text-[13px] font-bold leading-snug text-stone-100 transition-colors group-hover:text-amber-400">
                                  {item.tenQuan}
                                </h3>
                                <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-stone-400">
                                  <FaMapMarkerAlt
                                    size={9}
                                    className="shrink-0 text-stone-500"
                                  />
                                  <span className="truncate">{item.diaChi}</span>
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px]">
                                <span className="truncate rounded border border-amber-500/20 bg-amber-950/40 px-1.5 py-0.5 text-amber-400">
                                  {item.giaCa || t.common.updating}
                                </span>
                                {typeof item.distance === "number" &&
                                  item.distance < 100 && (
                                    <span className="shrink-0 text-emerald-400">
                                      {item.distance.toFixed(1)}km
                                    </span>
                                  )}
                                {reviews && (
                                  <span className="shrink-0 text-stone-500">
                                    {reviews}
                                  </span>
                                )}
                              </div>

                              {/* The evidence behind the placement. */}
                              <ResultReasons
                                reasons={item.reasons}
                                cautions={item.cautions}
                                compact
                              />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {/* Same quick replies as the full chat page: they narrow the
                    search without making the user type the follow-up. */}
                {msg.chips && msg.chips.length > 0 && (
                  <div
                    className="mt-2.5 flex w-full flex-wrap gap-1.5"
                    aria-label={t.chat.narrowLabel}
                  >
                    {msg.chips.map((chip) => (
                      <button
                        key={chip.query}
                        onClick={() => send(chip.query)}
                        className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[12px] font-medium text-amber-300 transition-colors hover:border-amber-500/60 hover:bg-amber-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex w-full justify-start gap-2">
              <BrandAvatar size={30} />
              <div
                className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-amber-900/40 bg-stone-900 px-4 py-3"
                aria-label={t.chat.typing}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-amber-500/70 motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {!atBottom && (
          <button
            onClick={jumpToLatest}
            className="absolute bottom-[112px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-stone-700 bg-stone-900/95 px-3 py-1.5 text-[11px] font-semibold text-stone-200 shadow-lg backdrop-blur transition hover:border-amber-500/40"
          >
            <FaArrowDown size={10} />
            {unread > 0 ? `${unread} ${t.chat.newMessages}` : t.chat.toBottom}
          </button>
        )}

        {/* -------- Composer -------- */}
        <div className="shrink-0 border-t border-stone-800 bg-stone-900">
          {/* Suggestions as a single scrollable row.
              As a wrapped block these took nearly half the panel height and
              pushed the input to the very bottom edge. */}
          <div
            className="flex gap-2 overflow-x-auto px-3 pb-1 pt-2.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={t.chat.suggestionsLabel}
          >
            {chatSuggestions(t).map((text) => (
              <button
                key={text}
                onClick={() => send(text)}
                className="shrink-0 whitespace-nowrap rounded-full border border-stone-700 bg-stone-800/60 px-3 py-1.5 text-[12px] text-stone-300 transition-colors hover:border-amber-500/50 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                {text}
              </button>
            ))}
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="p-3 pt-2"
          >
            <div className="flex items-center gap-2 rounded-xl border border-stone-700 bg-black/40 px-2.5 py-2 transition-colors focus-within:border-amber-500/60">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                aria-label={t.chat.imageLabel}
                title={t.chat.imageTitle}
                className="shrink-0 rounded-lg p-2 text-stone-400 transition-colors hover:text-amber-400 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
              >
                <FaImage size={17} />
              </button>

              <label htmlFor="nomnom-input" className="sr-only">
                {t.chat.inputLabel}
              </label>
              <input
                id="nomnom-input"
                ref={inputRef}
                type="text"
                autoComplete="off"
                className="min-w-0 flex-1 border-none bg-transparent px-1.5 py-1 text-sm text-stone-100 caret-amber-500 outline-none placeholder:text-stone-500"
                placeholder={t.chat.placeholderShort}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onCompositionStart={() => (composingRef.current = true)}
                onCompositionEnd={() => (composingRef.current = false)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !composingRef.current &&
                    !event.nativeEvent.isComposing
                  ) {
                    event.preventDefault();
                    send(input);
                  }
                }}
              />

              {/* Amber the moment there is something to send. Greyscale-only
                  styling made the enabled button look disabled. */}
              <button
                type="submit"
                disabled={!canSend}
                aria-label={t.chat.send}
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400 ${
                  canSend
                    ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-900/40 hover:brightness-110 active:scale-95"
                    : "cursor-not-allowed bg-stone-800 text-stone-600"
                }`}
              >
                {loading ? (
                  <FaSpinner
                    className="animate-spin motion-reduce:animate-none"
                    size={13}
                  />
                ) : (
                  <FaPaperPlane size={13} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
