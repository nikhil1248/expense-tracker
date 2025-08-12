import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

export default function CategoryPie({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-72 bg-white p-4 rounded-lg shadow">
      <h2 className="mb-4 font-bold">Category Distribution</h2>
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={110} label />
          <Tooltip formatter={(v: number) => `$${(v / 100).toFixed(2)}`} />
          <Legend />
          {data.map((_, i) => (
            <Cell key={i} /> // let Recharts pick default colors
          ))}
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
