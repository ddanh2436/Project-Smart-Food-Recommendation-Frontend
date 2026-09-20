// app/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
// [FIX] Import api từ lib thay vì dùng axios trực tiếp để đảm bảo BaseURL đúng (3001)
import api from '@/app/lib/api'; 
import { useRouter } from 'next/navigation';
import {
  getDict,
  LANG_CHANGE_EVENT,
  LANG_STORAGE_KEY,
  readStoredLang,
  type Dict,
} from '@/app/lib/i18n';

// The dictionary lives in app/lib/i18n.ts; see the note there.

interface User {
  id: string;
  email: string;
  username: string;
  picture?: string;
  // [FIX] Thêm các trường mới vào đây để khớp với ProfilePage
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  designation?: string;
  bio?: string;
}

type Lang = 'en' | 'vn';

// The storage key, the change event and the out-of-tree reader now live in
// app/lib/i18n.ts, so `app/lib/api.ts` can read the language without importing
// this module (which imports the API client, closing a cycle). Re-exported
// here because other modules already import them from this path.
export { LANG_CHANGE_EVENT, LANG_STORAGE_KEY, readStoredLang };

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  currentLang: Lang; 
  setLang: (lang: Lang) => void;
  T: Dict;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLang, setCurrentLang] = useState<Lang>('vn');
  const router = useRouter();

  const loadUser = async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        setIsLoading(false);
        return;
    }
    
    try {
      // [FIX] Sử dụng 'api' instance thay vì axios trực tiếp.
      // [FIX] Đổi endpoint từ '/users/profile' thành '/auth/profile'
      // api đã có sẵn header Authorization nhờ interceptor trong lib/api.ts
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Token invalid or expired:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
        setIsLoading(false); 
    }
  };

  useEffect(() => {
    /**
     * One storage key, one set of values.
     *
     * There were previously two independent language systems: this context
     * stored 'vn'|'en' under `appLang`, while the Header wrote 'vi'|'en' under
     * `app-language` and broadcast a `language-change` event that only some
     * pages listened for. So switching language updated the header but not the
     * restaurants page, and after a reload the two disagreed. Everything now
     * reads and writes LANG_STORAGE_KEY through setLang below.
     */
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY) as Lang | null;
      if (saved && (saved === 'vn' || saved === 'en')) {
        setCurrentLang(saved);
      } else {
        // Migrate a value written by the old Header ('vi' instead of 'vn').
        const legacy = localStorage.getItem('app-language');
        if (legacy === 'vi') setCurrentLang('vn');
        else if (legacy === 'en') setCurrentLang('en');
      }
    } catch {
      /* storage blocked: fall back to the default language */
    }

    loadUser();
  }, []);

  const setLang = (lang: Lang) => {
    setCurrentLang(lang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
      // Components that are not inside this provider's render tree (or that
      // read storage directly) still get notified.
      window.dispatchEvent(
        new CustomEvent(LANG_CHANGE_EVENT, { detail: lang })
      );
    } catch {
      /* non-fatal: the choice just will not persist */
    }
  };
  
  /**
   * Keep the document's own language attribute in step with the choice.
   *
   * The root layout can only render one value, and it is what a browser uses to
   * pick a fallback face and how a screen reader decides which voice to read the
   * page in - so leaving it on Vietnamese while the interface is English makes
   * the page announce English text with Vietnamese pronunciation.
   */
  useEffect(() => {
    document.documentElement.lang = currentLang === 'en' ? 'en' : 'vi';
  }, [currentLang]);

  const T = getDict(currentLang);

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      isLoading,
      currentLang, 
      setLang,     
      T            
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};