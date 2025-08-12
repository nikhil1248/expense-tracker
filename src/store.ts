import { persist } from "zustand/middleware";
import { v4 as uuid } from "uuid";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

/* -------------------- Types -------------------- */

export interface Transaction {
  id: string;
  amount: number;           // cents
  date: string;             // YYYY-MM-DD (or ISO)
  category: string;
  type: "income" | "expense";
  note?: string;
}

export interface Settings {
  currency: "USD" | "CAD" | "EUR" | "INR";
  darkMode: boolean;
  /** Per-category monthly budgets (in cents). Key = category name */
  budgets: Record<string, number>;
}

type State = {
  transactions: Transaction[];
  settings: Settings;

  addTx: (t: Omit<Transaction, "id">) => void;
  addMany: (txs: Omit<Transaction, "id">[]) => void;
  updateTx: (t: Transaction) => void;
  deleteTx: (id: string) => void;

  setSettings: (s: Partial<Settings>) => void;
  setBudget: (category: string, cents: number) => void;
  clearAll: () => void;
};

const ALLOWED_CURRENCIES = new Set<Settings["currency"]>(["USD","CAD","EUR","INR"]);

/* -------------------- Store -------------------- */

export const useAppStore = createWithEqualityFn<State>()(
  persist(
    (set) => ({
      transactions: [],
      settings: {
        currency: "USD",
        darkMode: false,
        budgets: {},         // e.g. { Food: 30000 } => $300.00
      },

      addTx: (t) =>
        set((s) => {
          if (!t.amount || t.amount <= 0 || !t.date || !t.category || !t.type) return s;
          return { transactions: [{ ...t, id: uuid() }, ...s.transactions] };
        }),

      addMany: (txs) =>
        set((s) => ({
          transactions: [
            ...txs
              .filter((t) => t.amount > 0 && t.date && t.category && t.type)
              .map((t) => ({ ...t, id: uuid() })),
            ...s.transactions,
          ],
        })),

      updateTx: (t) =>
        set((s) => ({
          transactions: s.transactions.map((x) => (x.id === t.id ? t : x)),
        })),

      deleteTx: (id) =>
        set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),

      setSettings: (s) =>
        set((st) => {
          const next = { ...st.settings, ...s };
          if (s.currency && !ALLOWED_CURRENCIES.has(s.currency)) {
            next.currency = st.settings.currency;
          }
          if (s.darkMode !== undefined) next.darkMode = !!s.darkMode;
          if (s.budgets && typeof s.budgets !== "object") next.budgets = st.settings.budgets;
          return { settings: next };
        }),

      setBudget: (category, cents) =>
        set((st) => ({
          settings: {
            ...st.settings,
            budgets: { ...st.settings.budgets, [category]: Math.max(0, Math.trunc(cents)) },
          },
        })),

      clearAll: () => set({ transactions: [] }),
    }),
    {
      name: "expense-tracker",
      version: 2,
      partialize: (state) => ({
        transactions: state.transactions,
        settings: state.settings,
      }),
      migrate: (persisted: unknown, fromVersion) => {
        type Persisted = Pick<State, "transactions" | "settings">;
        const data = persisted as Partial<Persisted> | undefined;
        if (!data) return data as any;

        // v1 -> v2: introduce budgets (default {})
        if (fromVersion < 2) {
          return {
            ...data,
            settings: {
              currency: data.settings?.currency ?? "USD",
              darkMode: typeof data.settings?.darkMode === "boolean" ? data.settings.darkMode : false,
              budgets: (data.settings as any)?.budgets ?? {},
            },
          } as Persisted;
        }
        return data as Persisted;
      },
    }
  )
);

/* -------------------- Selectors -------------------- */

export const useTransactions = () => useAppStore((s) => s.transactions);
export const useSettings = () => useAppStore((s) => s.settings);

export const getCurrencySymbol = (currency: Settings["currency"]) => {
  switch (currency) {
    case "USD": return "$";
    case "CAD": return "CA$";
    case "EUR": return "€";
    case "INR": return "₹";
    default: return "$";
  }
};

export const formatMoney = (cents: number, currency: Settings["currency"]) =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);

export const sumBy = <T,>(arr: T[], f: (x: T) => number) =>
  arr.reduce((s, x) => s + f(x), 0);

export type TxActions = Pick<State, "addTx" | "addMany" | "updateTx" | "deleteTx">;
export type SettingsActions = Pick<State, "setSettings" | "setBudget" | "clearAll">;

/** Sum expense (not income) for given month/category. month = "YYYY-MM" */
export const expenseSumFor = (txs: Transaction[], month: string, category?: string) =>
  txs
    .filter((t) => t.type === "expense")
    .filter((t) => !month || t.date.startsWith(month))
    .filter((t) => !category || t.category === category)
    .reduce((s, t) => s + t.amount, 0);


export const useTxActions: () => TxActions = () =>
  useAppStore(
    (s) => ({
      addTx: s.addTx,
      addMany: s.addMany,
      updateTx: s.updateTx,
      deleteTx: s.deleteTx,
    }),
    shallow
  );

export const useSettingsActions = () =>
  useAppStore(
    (s) => ({
      setSettings: s.setSettings,
      setBudget: s.setBudget,
      clearAll: s.clearAll,
    }),
    shallow // ✅ equality function
  );