import type * as React from 'react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { copy, type Locale, type CopyKey } from '@/lib/weechat/i18n';
type DemoState = { locale: Locale; setLocale: (v: Locale) => void; t: (key: CopyKey) => string };
// Keep one context instance across hot reloads so provider and consumers always match.
const g = globalThis as { __weechatDemoContext?: React.Context<DemoState | null> };
const DemoContext = (g.__weechatDemoContext ??= createContext<DemoState | null>(null));
export function DemoProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');
  useEffect(() => { const stored = localStorage.getItem('weechat-ui-locale'); if (stored === 'en' || stored === 'fr') setLocale(stored); }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const updateLocale = (value: Locale) => { setLocale(value); localStorage.setItem('weechat-ui-locale', value); document.documentElement.lang = value; };
  return <DemoContext.Provider value={{ locale, setLocale: updateLocale, t: key => copy[locale][key] }}>{children}</DemoContext.Provider>;
}
export function useDemo() { const state = useContext(DemoContext); if (!state) throw new Error('DemoProvider required'); return state; }
