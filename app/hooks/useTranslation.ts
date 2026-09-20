"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { getDict, normalizeLang, type Dict, type Lang } from "@/app/lib/i18n";

/**
 * The current language and its dictionary.
 *
 * Every component reads strings through this one hook, so there is a single
 * place where "which language is the app in" is answered. `lang` is also the
 * value the API expects (`vi` | `en`), which is how the assistant's replies and
 * the AI review breakdown end up in the same language as the interface around
 * them — the backend and the AI service have accepted a `lang` parameter all
 * along, the frontend just never passed the user's actual choice.
 */
export function useTranslation(): { lang: Lang; t: Dict } {
  const { currentLang } = useAuth();
  const lang = normalizeLang(currentLang);
  return { lang, t: getDict(lang) };
}
