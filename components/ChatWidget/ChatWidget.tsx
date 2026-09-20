"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  FaPaperPlane,
  FaComments,
  FaRobot,
  FaMapMarkerAlt,
  FaStar,
  FaImage,
  FaSpinner,
  FaChevronDown,
  FaArrowDown,
  FaLocationArrow,
  FaRedo,
  FaTrash,
} from "react-icons/fa";
import { CHAT_SUGGESTIONS, useChatSession } from "@/app/hooks/useChatSession";

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

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [atBottom, setAtBottom] = useState(true);
  const [unread, setUnread] = useState(0);

  // Conversation state lives in a shared hook so the floating widget and the
  // full chat page cannot drift apart.
  const {
    messages,
    loading,
    coords,
    geoStatus,
    send: sendMessage,
    sendImage,
    enableLocationAndRetry,
    reset,
  } = useChatSession("vi");

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
    // Focus the field so the user can type immediately.
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
    // Allow re-picking the same file.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearChat = () => {
    reset();
    setUnread(0);
    setAtBottom(true);
  };

  const lastMessage = messages[messages.length - 1];
  const showSuggestions =
    !loading &&
    (messages.length <= 1 || lastMessage?.kind === "not_found");

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* Launcher                                                          */}
      {/* ---------------------------------------------------------------- */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Mở trợ lý tìm quán ăn"
        className={`group fixed bottom-5 right-5 z-[9998] flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl shadow-orange-900/40 transition duration-300 hover:scale-105 hover:shadow-orange-600/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400 active:scale-95 motion-reduce:transition-none sm:h-16 sm:w-16 ${
          isOpen
            ? "pointer-events-none scale-0 opacity-0"
            : "scale-100 opacity-100"
        }`}
      >
        <FaComments size={26} />
        <span className="pointer-events-none absolute right-[4.5rem] hidden whitespace-nowrap rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-amber-400 opacity-0 shadow-xl transition-opacity group-hover:opacity-100 sm:block">
          Tìm quán ngon ngay!
        </span>
      </button>

      {/* Backdrop, phone only: the panel covers the screen there, so the page
          behind it should not be interactive. */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm sm:hidden"
          aria-hidden="true"
        />
      )}

      {/* ---------------------------------------------------------------- */}
      {/* Panel                                                             */}
      {/* ---------------------------------------------------------------- */}
      <div
        role="dialog"
        aria-modal="false"
        aria-label="Trợ lý ẩm thực NomNom"
        className={`fixed z-[9999] flex flex-col overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl shadow-black/60 transition-all duration-300 ease-out motion-reduce:transition-none
          inset-x-0 bottom-0 top-0 rounded-none
          sm:inset-auto sm:bottom-5 sm:right-5 sm:top-auto sm:h-[min(640px,calc(100vh-3rem))] sm:w-[400px] sm:rounded-2xl
          ${
            isOpen
              ? "pointer-events-auto translate-y-0 opacity-100 sm:scale-100"
              : "pointer-events-none translate-y-6 opacity-0 sm:scale-95"
          }`}
      >
        {/* -------- Header -------- */}
        <header className="relative flex shrink-0 items-center justify-between gap-2 border-b border-white/5 bg-slate-900/90 px-4 py-3">
          <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-amber-500/10 blur-3xl" />
          <div className="relative z-10 flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-slate-950">
              <FaRobot size={18} className="text-amber-400" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold tracking-wide text-white">
                NomNom Assistant
              </h2>
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                {coords ? "Đã biết vị trí của bạn" : "Sẵn sàng hỗ trợ"}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1">
            <button
              onClick={clearChat}
              aria-label="Xóa cuộc trò chuyện"
              title="Xóa cuộc trò chuyện"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <FaTrash size={13} />
            </button>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Thu nhỏ cửa sổ chat"
              className="rounded-full p-2 text-slate-400 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <FaChevronDown size={15} />
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
          className="relative flex-1 space-y-4 overflow-y-auto bg-slate-950 px-4 py-4"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full gap-2 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "bot" && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-amber-500">
                  <FaRobot size={13} />
                </div>
              )}

              <div
                className={`flex max-w-[86%] flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="Ảnh món ăn bạn đã gửi"
                    className="mb-2 h-32 w-32 rounded-xl border border-amber-500/30 object-cover"
                  />
                )}

                <div
                  className={`whitespace-pre-line px-4 py-2.5 text-[14px] leading-relaxed ${
                    msg.sender === "user"
                      ? "rounded-2xl rounded-tr-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white"
                      : "rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900 text-slate-200"
                  }`}
                >
                  <RichText text={msg.text} />
                </div>

                {/* Location prompt, shown when the answer needed coordinates. */}
                {msg.kind === "need_location" && !coords && (
                  <button
                    onClick={enableLocationAndRetry}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-[13px] font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                  >
                    <FaLocationArrow size={12} />
                    {geoStatus === "denied"
                      ? "Bật lại quyền vị trí trong trình duyệt"
                      : "Cho phép truy cập vị trí"}
                  </button>
                )}

                {/* Retry, shown when the request itself failed. */}
                {msg.failedQuery && (
                  <button
                    onClick={() => send(msg.failedQuery!)}
                    className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-[13px] font-semibold text-slate-300 transition-colors hover:border-amber-500/40 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                  >
                    <FaRedo size={11} /> Thử lại
                  </button>
                )}

                {/* -------- Result cards -------- */}
                {msg.results && msg.results.length > 0 && (
                  <ul className="mt-3 w-full space-y-2">
                    {msg.results.map((item) => (
                      <li key={item._id}>
                        <Link
                          href={`/restaurants/${item._id}`}
                          className="group flex h-[84px] overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60 transition-colors hover:border-amber-500/40 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
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
                            <span className="absolute left-1 top-1 flex items-center gap-1 rounded bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 backdrop-blur-sm">
                              <FaStar size={8} />
                              {item.diemTrungBinh
                                ? item.diemTrungBinh.toFixed(1)
                                : "N/A"}
                            </span>
                          </div>

                          <div className="flex min-w-0 flex-1 flex-col justify-between p-2.5">
                            <div className="min-w-0">
                              <h3 className="truncate text-[13px] font-bold text-slate-100 transition-colors group-hover:text-amber-400">
                                {item.tenQuan}
                              </h3>
                              <p className="mt-0.5 flex items-center gap-1 truncate text-[10px] text-slate-400">
                                <FaMapMarkerAlt
                                  size={9}
                                  className="shrink-0 text-slate-500"
                                />
                                <span className="truncate">{item.diaChi}</span>
                              </p>
                            </div>

                            <div className="flex items-center gap-1.5 text-[10px]">
                              <span className="truncate rounded border border-amber-500/20 bg-amber-950/30 px-1.5 py-0.5 text-amber-500">
                                {item.giaCa || "Đang cập nhật"}
                              </span>
                              {/* Distance and review count explain the ordering,
                                  which otherwise looks arbitrary. */}
                              {typeof item.distance === "number" &&
                                item.distance < 100 && (
                                  <span className="shrink-0 text-emerald-400">
                                    {item.distance.toFixed(1)}km
                                  </span>
                                )}
                              {typeof item.reviewCount === "number" &&
                                item.reviewCount > 0 && (
                                  <span className="shrink-0 text-slate-500">
                                    {item.reviewCount} đánh giá
                                  </span>
                                )}
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex w-full justify-start gap-2">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-amber-500">
                <FaRobot size={13} />
              </div>
              <div
                className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-800 bg-slate-900 px-4 py-3"
                aria-label="Trợ lý đang soạn câu trả lời"
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 motion-reduce:animate-none"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Jump-to-latest, only while scrolled away from the bottom. */}
        {!atBottom && (
          <button
            onClick={jumpToLatest}
            className="absolute bottom-[104px] left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/95 px-3 py-1.5 text-[11px] font-semibold text-slate-200 shadow-lg backdrop-blur transition hover:border-amber-500/40"
          >
            <FaArrowDown size={10} />
            {unread > 0 ? `${unread} tin nhắn mới` : "Xuống cuối"}
          </button>
        )}

        {/* -------- Suggestions -------- */}
        {showSuggestions && (
          <div className="shrink-0 border-t border-slate-800/60 bg-slate-950 px-3 pt-3">
            <p className="mb-2 text-[11px] font-medium text-slate-500">
              Thử hỏi:
            </p>
            <div className="flex flex-wrap gap-1.5 pb-1">
              {CHAT_SUGGESTIONS.map((text) => (
                <button
                  key={text}
                  onClick={() => send(text)}
                  className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-[12px] text-slate-300 transition-colors hover:border-amber-500/50 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
                >
                  {text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* -------- Composer -------- */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            send(input);
          }}
          className="shrink-0 border-t border-slate-800 bg-slate-900 p-3"
        >
          <div className="flex items-center gap-1 rounded-xl border border-slate-700 bg-black/40 px-2 py-1.5 transition-colors focus-within:border-amber-500/60">
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
              aria-label="Gửi ảnh món ăn để nhận diện"
              title="Gửi ảnh món ăn"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:text-amber-400 disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400"
            >
              <FaImage size={17} />
            </button>

            <label htmlFor="nomnom-input" className="sr-only">
              Nhập câu hỏi cho trợ lý
            </label>
            <input
              id="nomnom-input"
              ref={inputRef}
              type="text"
              autoComplete="off"
              className="min-w-0 flex-1 border-none bg-transparent px-1 text-sm text-slate-200 caret-amber-500 outline-none placeholder:text-slate-500"
              placeholder="Món ăn, khu vực, mức giá..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              // Vietnamese typing goes through an IME: Enter mid-composition
              // picks a candidate and must not submit the message.
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
              aria-label="Gửi"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white transition-all hover:shadow-md hover:shadow-orange-500/20 active:scale-95 disabled:grayscale disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-amber-400"
            >
              {loading ? (
                <FaSpinner className="animate-spin motion-reduce:animate-none" size={13} />
              ) : (
                <FaPaperPlane size={13} />
              )}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
