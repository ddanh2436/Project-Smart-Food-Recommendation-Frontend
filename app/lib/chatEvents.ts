/**
 * Opening the chat drawer from elsewhere on the page.
 *
 * The header's "AI assistant" link and the floating launcher used to lead to
 * two different chats: a separate /chatbot page and the floating window. The
 * link now asks the drawer to open instead. It dispatches a cancelable event;
 * a mounted drawer cancels it, and if none is mounted (the pages that hide
 * it) the link simply navigates to /chatbot as before.
 */
export const CHAT_OPEN_EVENT = "vnn:chat-open";

/** True when a drawer on this page took the request. */
export function requestChatDrawer(): boolean {
  if (typeof window === "undefined") return false;
  const event = new Event(CHAT_OPEN_EVENT, { cancelable: true });
  return !window.dispatchEvent(event);
}
