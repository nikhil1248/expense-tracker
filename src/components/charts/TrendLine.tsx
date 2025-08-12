import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function TrendLine({ data }: { data: { day: string; spend: number }[] }) {
  return (
    <div className="h-72 bg-white p-4 rounded-lg shadow">
      <h2 className="mb-4 font-bold">Daily Spend Trend</h2>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip formatter={(v: number) => `$${(v / 100).toFixed(2)}`} />
          <Line type="monotone" dataKey="spend" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
