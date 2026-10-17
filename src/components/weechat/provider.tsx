import type * as React from 'react';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { copy, type Locale, type CopyKey } from '@/lib/weechat/i18n';
import { initialBalance, demoTransactions, type Transaction } from '@/lib/weechat/demo-data';
type DemoState = { locale: Locale; setLocale: (v: Locale) => void; t: (key: CopyKey) => string; balance: number; transactions: Transaction[]; purchase: (amount: number, name: string) => void };
// Keep one context instance across hot reloads so provider and consumers always match.
const g = globalThis as { __weechatDemoContext?: React.Context<DemoState | null> };
const DemoContext = (g.__weechatDemoContext ??= createContext<DemoState | null>(null));
export function DemoProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('fr');
  useEffect(() => { const stored = localStorage.getItem('weechat-ui-locale'); if (stored === 'en' || stored === 'fr') setLocale(stored); }, []);
  useEffect(() => { document.documentElement.lang = locale; }, [locale]);
  const updateLocale = (value: Locale) => { setLocale(value); localStorage.setItem('weechat-ui-locale', value); document.documentElement.lang = value; };
  const [balance, setBalance] = useState(initialBalance);
  const [transactions, setTransactions] = useState(demoTransactions);
  const purchase = (amount: number, name: string) => {
    setBalance(v => v + amount);
    setTransactions(v => [{ id: crypto.randomUUID(), date: 'Aujourd’hui', title: `Pack ${name} · simulation`, type: 'purchase', amount }, ...v]);
  };
  return <DemoContext.Provider value={{ locale, setLocale: updateLocale, t: key => copy[locale][key], balance, transactions, purchase }}>{children}</DemoContext.Provider>;
}
export function useDemo() { const state = useContext(DemoContext); if (!state) throw new Error('DemoProvider required'); return state; }
