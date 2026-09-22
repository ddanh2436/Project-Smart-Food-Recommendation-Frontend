"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  FaPaperPlane,
  FaMapMarkerAlt,
  FaEraser,
  FaChevronLeft,
  FaImage,
  FaSpinner,
  FaArrowDown,
  FaLocationArrow,
  FaRedo,
} from "react-icons/fa";
import { chatSuggestions, useChatSession } from "@/app/hooks/useChatSession";
import { formatReviewCount } from "@/app/lib/rating";
import { ScoreBadge } from "@/components/Score/Score";

/** The brand mark, used instead of a generic robot glyph. */
function BrandAvatar({ size = 36 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-amber-500/30 bg-stone-900"
      style={{ width: size, height: size }}
    >
      <Image
        src="/assets/image/logo.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain p-1"
      />
    </span>
  );
}

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

function ChatbotContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);

  // Same conversation engine as the floating widget; the two used to keep
  // separate copies of this logic and drifted apart.
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
  // Vietnamese typing goes through an IME: Enter mid-composition picks a
  // candidate and must not submit.
  const composingRef = useRef(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Opening question passed in on the query string.
   *
   * The restaurant page links here with `?q=...` so its quick-ask chips land
   * the user in a conversation rather than an empty input. Guarded by a ref so
   * React's StrictMode double-mount does not ask it twice.
   */
  const askedRef = useRef(false);
  useEffect(() => {
    if (askedRef.current) return;
    const question = searchParams.get("q");
    if (!question?.trim()) return;
    askedRef.current = true;
    void sendMessage(question);
    // Drop the parameter so a refresh does not re-ask it.
    router.replace("/chatbot");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Follow new messages only when the user is already at the bottom, so
  // scrolling back to read earlier results is not interrupted.
  useEffect(() => {
    if (atBottom) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, loading]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setAtBottom(el.scrollHeight - el.scrollTop - el.clientHeight < 100);
  };

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

  const lastMessage = messages[messages.length - 1];
  const showSuggestions =
    !loading && (messages.length <= 1 || lastMessage?.kind === "not_found");

  return (
    <div className="relative flex h-[100dvh] flex-col overflow-hidden bg-stone-950 font-sans text-stone-200">
      {/* Ambient background */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[480px] w-[480px] rounded-full bg-amber-900/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-amber-900/20 blur-[120px]" />

      {/* ------------------------------- Header ------------------------------ */}
      <header className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-b border-white/5 bg-stone-900/70 px-4 py-3 backdrop-blur-xl sm:px-6 sm:py-4">
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <button
            onClick={() => router.push("/")}
            aria-label={t.common.backHome}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/5 text-stone-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
          >
            <FaChevronLeft />
          </button>

          <div className="flex min-w-0 items-center gap-3">
            <BrandAvatar size={44} />
            <div className="min-w-0">
              <h1 className="flex items-center gap-2 truncate text-base font-bold tracking-wide text-white sm:text-lg">
                NomNom Assistant
                <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] text-amber-400">
                  AI
                </span>
              </h1>
              <p className="flex items-center gap-1.5 text-xs text-stone-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {coords ? t.chat.knowsLocation : t.chat.ready}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={reset}
          className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-stone-400 transition-colors hover:bg-white/5 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
        >
          <FaEraser /> <span className="hidden sm:inline">{t.chat.reset}</span>
        </button>
      </header>

      {/* ------------------------------- Messages ---------------------------- */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="relative z-10 flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8"
      >
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full gap-3 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && <BrandAvatar size={36} />}

              <div
                className={`flex max-w-[min(85%,42rem)] flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt={t.chat.sentImageAlt}
                    className="mb-2 h-40 w-40 rounded-xl border border-amber-500/30 object-cover"
                  />
                )}

                <div
                  className={`whitespace-pre-line px-4 py-3 text-[15px] leading-relaxed ${
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
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
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
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-sm font-semibold text-stone-300 transition-colors hover:border-amber-500/40 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                  >
                    <FaRedo size={12} /> {t.common.retry}
                  </button>
                )}

                {msg.results && msg.results.length > 0 && (
                  <ul className="mt-3 grid w-full gap-2.5 sm:grid-cols-2">
                    {msg.results.map((item) => (
                      <li key={item._id}>
                        <Link
                          href={`/restaurants/${item._id}`}
                          className="group flex h-[92px] overflow-hidden rounded-xl border border-stone-800 bg-stone-900/60 transition-colors hover:border-amber-500/40 hover:bg-stone-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                        >
                          <div className="relative h-full w-[92px] shrink-0 overflow-hidden">
                            <img
                              src={item.avatarUrl || "/assets/image/pho.png"}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 motion-reduce:transition-none"
                              onError={(event) => {
                                const target = event.target as HTMLImageElement;
                                if (!target.src.includes("/assets/image/pho.png")) {
                                  target.src = "/assets/image/pho.png";
                                }
                              }}
                            />
                            <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm">
                              <ScoreBadge score={item.diemTrungBinh} withScale />
                            </span>
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-between p-3">
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 text-sm font-bold leading-snug text-stone-100 transition-colors group-hover:text-amber-400">
                                {item.tenQuan}
                              </h3>
                              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-stone-400">
                                <FaMapMarkerAlt
                                  size={9}
                                  className="shrink-0 text-stone-500"
                                />
                                <span className="truncate">{item.diaChi}</span>
                              </p>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <span className="truncate rounded border border-amber-500/20 bg-amber-950/30 px-1.5 py-0.5 text-amber-500">
                                {item.giaCa || t.common.updating}
                              </span>
                              {typeof item.distance === "number" &&
                                item.distance < 100 && (
                                  <span className="shrink-0 text-emerald-400">
                                    {item.distance.toFixed(1)}km
                                  </span>
                                )}
                              {formatReviewCount(item.reviewCount, lang) && (
                                <span className="shrink-0 text-stone-500">
                                  {formatReviewCount(item.reviewCount, lang)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Quick replies that narrow the search. They sit under the
                    results rather than replacing them, so a broad question
                    still gets an answer and the chips are an offer, not a
                    gate. Each carries a complete follow-up query composed by
                    the assistant from what the question left unset. */}
                {msg.chips && msg.chips.length > 0 && (
                  <div
                    className="mt-3 flex w-full flex-wrap gap-2"
                    aria-label={t.chat.narrowLabel}
                  >
                    {msg.chips.map((chip) => (
                      <button
                        key={chip.query}
                        onClick={() => send(chip.query)}
                        className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[13px] font-medium text-amber-300 transition-colors hover:border-amber-500/60 hover:bg-amber-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
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
            <div className="flex w-full justify-start gap-3">
              <BrandAvatar size={36} />
              <div
                className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-amber-900/40 bg-stone-900 px-4 py-3.5"
                aria-label={t.chat.typing}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-2 w-2 animate-bounce rounded-full bg-amber-500/70 motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </div>

      {!atBottom && (
        <button
          onClick={() => {
            endRef.current?.scrollIntoView({ behavior: "smooth" });
            setAtBottom(true);
          }}
          className="absolute bottom-28 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-stone-700 bg-stone-900/95 px-4 py-2 text-xs font-semibold text-stone-200 shadow-lg backdrop-blur transition hover:border-amber-500/40"
        >
          <FaArrowDown size={11} /> {t.chat.toBottom}
        </button>
      )}

      {/* ------------------------------- Composer ---------------------------- */}
      <div className="relative z-20 shrink-0 border-t border-white/5 bg-stone-900/70 backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-8 sm:py-4">
          {showSuggestions && (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label={t.chat.suggestionsLabel}>
              {chatSuggestions(t).map((text) => (
                <button
                  key={text}
                  onClick={() => send(text)}
                  className="shrink-0 whitespace-nowrap rounded-full border border-stone-700 bg-stone-800/60 px-3.5 py-1.5 text-[13px] text-stone-300 transition-colors hover:border-amber-500/50 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(event) => {
              event.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 rounded-2xl border border-stone-700 bg-black/40 px-3 py-2 transition-colors focus-within:border-amber-500/60"
          >
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
              className="rounded-lg p-2.5 text-stone-400 transition-colors hover:text-amber-400 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <FaImage size={18} />
            </button>

            <label htmlFor="chatbot-input" className="sr-only">
              {t.chat.inputLabel}
            </label>
            <input
              id="chatbot-input"
              ref={inputRef}
              type="text"
              autoComplete="off"
              className="min-w-0 flex-1 border-none bg-transparent px-1 text-[15px] text-stone-200 caret-amber-500 outline-none placeholder:text-stone-500"
              placeholder={t.chat.placeholder}
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

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t.chat.send}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400 ${
                input.trim() && !loading
                  ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-orange-900/40 hover:brightness-110 active:scale-95"
                  : "cursor-not-allowed bg-stone-800 text-stone-600"
              }`}
            >
              {loading ? (
                <FaSpinner className="animate-spin motion-reduce:animate-none" size={14} />
              ) : (
                <FaPaperPlane size={14} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * `useSearchParams` requires a Suspense boundary in the App Router, so the
 * page shell wraps the content that reads it.
 */
export default function ChatbotPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex h-[100dvh] items-center justify-center bg-stone-950"
          role="status"
          aria-label="Loading"
        >
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-stone-700 border-t-amber-500 motion-reduce:animate-none" />
        </div>
      }
    >
      <ChatbotContent />
    </Suspense>
  );
}
