// src/components/BudgetSettings.tsx
import { useMemo, useState } from "react";
import { useSettings, useTransactions, useAppStore, formatMoney } from "../store";


export default function BudgetSettings() {
  const settings = useSettings();
  const txs = useTransactions();
  const setBudget = useAppStore((s) => s.setBudget); 
  const [newCat, setNewCat] = useState("");

  // existing categories (from data) + any that already have budgets
  const categories = useMemo(() => {
    const set = new Set<string>(Object.keys(settings.budgets));
    txs.forEach((t) => set.add(t.category));
    return Array.from(set).sort();
  }, [settings.budgets, txs]);

  return (
    <section className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Monthly Budgets</h2>
        <span className="text-xs text-gray-500">({settings.currency})</span>
      </div>

      <div className="space-y-2">
        {categories.length === 0 && (
          <p className="text-sm text-gray-500">
            No categories yet. Add a transaction to begin.
          </p>
        )}

        {categories.map((c) => {
          const cents = settings.budgets[c] ?? 0;
          return (
            <div key={c} className="flex items-center gap-2">
              <label className="w-36 shrink-0">{c}</label>
              <input
                type="number"
                step="0.01"
                min={0}
                className="p-2 border rounded w-36 bg-white dark:bg-gray-900"
                value={(cents / 100).toFixed(2)}
                onChange={(e) => {
                  const dollars = Number(e.target.value || "0");
                  setBudget(c, Math.max(0, Math.round(dollars * 100)));
                }}
              />
              <span className="text-xs text-gray-500">
                {formatMoney(cents, settings.currency)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
        <input
          value={newCat}
          onChange={(e) => setNewCat(e.target.value)}
          placeholder="Add new category"
          className="p-2 border rounded flex-1 bg-white dark:bg-gray-900"
        />
        <button
          onClick={() => {
            const c = newCat.trim();
            if (!c) return;
            if (settings.budgets[c] === undefined) setBudget(c, 0);
            setNewCat("");
          }}
          className="px-3 py-2 rounded bg-indigo-600 text-white"
        >
          Add
        </button>
      </div>
    </section>
  );
}
