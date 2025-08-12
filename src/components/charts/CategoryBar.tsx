import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { formatMoney } from "../../lib/money";
import { useAppStore } from "../../store"

export default function CategoryBar({ data }: { data: { category: string; total: number }[] }) {
    const currency = useAppStore(s => s.settings.currency);
<Tooltip formatter={(v: number) => formatMoney(v, currency)} />
  return (
    <div className="h-72 bg-white p-4 rounded-lg shadow">
      <h2 className="mb-4 font-bold">Expenses by Category</h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip formatter={(v: number) => `$${(v / 100).toFixed(2)}`} />
          <Bar dataKey="total" fill="#6366F1" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
