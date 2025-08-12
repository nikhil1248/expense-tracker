import { useMemo, useState } from "react";
import { useTransactions, useSettings } from "./store";
import { formatMoney } from "./store";
import TransactionForm from "./components/TransactionForm";
import Filters from "./components/Filters";
import CategoryBar from "./components/charts/CategoryBar";
import CategoryPie from "./components/charts/CategoryPie";
import TrendLine from "./components/charts/TrendLine";
import CSVControls from "./components/CSVControls";
import DarkModeToggle from "./components/DarkModeToggle";
import CurrencySelect from "./components/CurrencySelect";
import BudgetSettings from "./components/BudgetSettings";
import BudgetProgress from "./components/BudgetProgress";


export default function App() {
  const transactions = useTransactions();
  const settings = useSettings();

  // Filters (month/type/category/search) — same as before
  const [month, setMonth] = useState<string>(() => new Date().toISOString().slice(0,7));
  const [type, setType] = useState<"all" | "income" | "expense">("all");
  const [category, setCategory] = useState<string>("all");
  const [q, setQ] = useState<string>("");

  const categories = useMemo(() => {
    const set = new Set<string>(["Food","Rent","Transport"]);
    transactions.forEach(t => set.add(t.category));
    return Array.from(set).sort();
  }, [transactions]);

  const filtered = useMemo(() => {
    return transactions.filter(t => {
      if (month && !t.date.startsWith(month)) return false;
      if (type !== "all" && t.type !== type) return false;
      if (category !== "all" && t.category !== category) return false;
      if (q) {
        const s = q.toLowerCase();
        const hay = `${t.category} ${t.note ?? ""}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });
  }, [transactions, month, type, category, q]);

  const expenseTotal = useMemo(
    () => filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );
  const incomeTotal = useMemo(
    () => filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [filtered]
  );

  const categoryData = useMemo(() => {
    const map: Record<string,{category:string; total:number}> = {};
    filtered.filter(t => t.type === "expense").forEach(t => {
      if (!map[t.category]) map[t.category] = { category: t.category, total: 0 };
      map[t.category].total += t.amount;
    });
    return Object.values(map);
  }, [filtered]);

  const pieData = useMemo(
    () => categoryData.map(c => ({ name: c.category, value: c.total })),
    [categoryData]
  );

  const lineData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(t => t.type === "expense").forEach(t => {
      const day = t.date.slice(8, 10);
      map[day] = (map[day] ?? 0) + t.amount;
    });
    return Object.entries(map)
      .sort(([a],[b]) => Number(a) - Number(b))
      .map(([day, spend]) => ({ day, spend }));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
          <h1 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
            Expense Tracker
          </h1>
          <div className="ml-auto flex items-center gap-2">
            <CurrencySelect />
            <DarkModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 space-y-6">
        <TransactionForm />

        <Filters
          month={month} setMonth={setMonth}
          type={type} setType={setType}
          category={category} setCategory={setCategory}
          q={q} setQ={setQ}
          categories={categories}
        />

        {/* Totals + CSV */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-green-100 dark:bg-green-900/40 dark:text-green-200 p-3 rounded-lg">
              Income: {formatMoney(incomeTotal, settings.currency)}
            </div>
            <div className="bg-red-100 dark:bg-red-900/40 dark:text-red-200 p-3 rounded-lg">
              Expense: {formatMoney(expenseTotal, settings.currency)}
            </div>
          </div>
          <CSVControls rows={filtered} />
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6">
          <CategoryBar data={categoryData} />
          <TrendLine data={lineData} />
        </div>
        <CategoryPie data={pieData} />

        {/* Budgets */}
        <BudgetProgress month={month} />
        <BudgetSettings />
      </main>
    </div>
  );
}
