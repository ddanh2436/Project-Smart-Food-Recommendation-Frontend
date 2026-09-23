/**
 * Where to send the user after a Google sign-in.
 *
 * Google sign-in leaves the site and comes back to /auth/callback, so the page
 * the user was on when they chose to sign in is lost unless it is written down
 * first. Session storage rather than a query parameter on the OAuth URL: the
 * backend would have to carry it through Google and back, and a destination
 * read from a URL is an open redirect waiting for a missing check.
 */
const KEY = "vnn_return_to";

/** Only same-site paths, and never back into the sign-in pages themselves. */
function isSafePath(path: string | null): path is string {
  return (
    !!path &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/\\") &&
    !path.startsWith("/auth")
  );
}

export function rememberReturnTo(path: string): void {
  if (!isSafePath(path)) return;
  try {
    window.sessionStorage.setItem(KEY, path);
  } catch {
    /* storage blocked: the user lands on the home page instead */
  }
}

/** Read the stored destination once, falling back to the home page. */
export function takeReturnTo(): string {
  try {
    const path = window.sessionStorage.getItem(KEY);
    window.sessionStorage.removeItem(KEY);
    return isSafePath(path) ? path : "/";
  } catch {
    return "/";
  }
}
