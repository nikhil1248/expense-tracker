import { useMemo } from "react";
import { useSettings, useTransactions, expenseSumFor, formatMoney } from "../store";

export default function BudgetProgress({ month }: { month: string }) {
  const settings = useSettings();
  const txs = useTransactions();

  const rows = useMemo(() => {
    const entries = Object.entries(settings.budgets);
    return entries.map(([category, budget]) => {
      const spent = expenseSumFor(txs, month, category);
      const pct = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
      return { category, budget, spent, pct, over: spent > budget && budget > 0 };
    }).sort((a, b) => (b.spent - a.spent));
  }, [settings.budgets, txs, month]);

  if (!rows.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
        <p className="text-sm text-gray-500">No budgets set. Add budgets in Settings.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
      <h2 className="font-semibold">Budget Usage ({month})</h2>
      <div className="space-y-3">
        {rows.map(({ category, budget, spent, pct, over }) => (
          <div key={category}>
            <div className="flex items-center justify-between text-sm">
              <span>{category}</span>
              <span className={over ? "text-red-600" : ""}>
                {formatMoney(spent, settings.currency)} / {formatMoney(budget, settings.currency)}
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
              <div
                className={`h-full ${over ? "bg-red-500" : "bg-indigo-500"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            {over && (
              <p className="text-xs text-red-600 mt-1">Over budget by {formatMoney(spent - budget, settings.currency)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
