import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'lang';
const EVENT_NAME = 'bullsage:langchange';

function readLang() {
  return localStorage.getItem(STORAGE_KEY) || 'zh';
}

// Shared language preference, persisted to localStorage and kept in sync
// across every component that uses this hook within the same page.
export default function useLang() {
  const [lang, setLangState] = useState(readLang);

  useEffect(() => {
    const onChange = () => setLangState(readLang());
    window.addEventListener(EVENT_NAME, onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener(EVENT_NAME, onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const setLang = useCallback((next) => {
    localStorage.setItem(STORAGE_KEY, next);
    window.dispatchEvent(new Event(EVENT_NAME));
  }, []);

  return [lang, setLang];
}
