import { useMemo } from "react";

type Props = {
  month: string;                // "2025-08"
  setMonth: (v: string) => void;
  type: "all" | "income" | "expense";
  setType: (v: "all" | "income" | "expense") => void;
  category: string;             // "all" or a category
  setCategory: (v: string) => void;
  q: string;
  setQ: (v: string) => void;
  categories: string[];
};

export default function Filters({
  month, setMonth,
  type, setType,
  category, setCategory,
  q, setQ,
  categories,
}: Props) {
  const monthMax = useMemo(() => new Date().toISOString().slice(0,7), []);
  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-wrap gap-3 items-center">
      <label className="text-sm">Month
        <input
          type="month"
          value={month}
          max={monthMax}
          onChange={(e) => setMonth(e.target.value)}
          className="ml-2 p-2 border rounded"
        />
      </label>

      <select value={type} onChange={e => setType(e.target.value as any)}
              className="p-2 border rounded">
        <option value="all">All types</option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <select value={category} onChange={e => setCategory(e.target.value)}
              className="p-2 border rounded">
        <option value="all">All categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search note/category…"
        className="p-2 border rounded flex-1 min-w-[180px]"
      />
    </div>
  );
}
