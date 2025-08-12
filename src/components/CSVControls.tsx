// src/components/CSVControls.tsx
import { parseCSV, toCSV, download, rowSchema } from "../lib/csv";
import type { CsvRow } from "../lib/csv";
import { useAppStore } from "../store";
import type { Transaction } from "../store";
import type { ChangeEvent } from "react";

export default function CSVControls({ rows }: { rows: Transaction[] }) {
  const addMany = useAppStore((s) => s.addMany);
  const existing = useAppStore((s) => s.transactions);

  const onExport = () => {
    const csv = toCSV(rows);
    const stamp = new Date().toISOString().slice(0, 10);
    download(`expenses-${stamp}.csv`, csv);
  };

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();

    try {
      const raw = parseCSV(text);
      const valid: CsvRow[] = [];
      const errors: string[] = [];

      raw.forEach((r, i) => {
        const res = rowSchema.safeParse(r);
        if (res.success) valid.push(res.data);
        else errors.push(`Row ${i + 2}: ${res.error.issues.map((x) => x.message).join(", ")}`);
      });

      // de-dup against existing + within file
      const seen = new Set<string>(
        existing.map((t) => `${t.date}|${t.type}|${t.category}|${t.amount}`)
      );
      const deduped = valid.filter((r) => {
        const key = `${r.date}|${r.type}|${r.category}|${r.amount_cents}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      const txs: Omit<Transaction, "id">[] = deduped.map((r) => ({
        amount: r.amount_cents,
        date: r.date,
        category: r.category,
        type: r.type,
        note: r.note ?? "",
      }));

      if (txs.length) addMany(txs);

      const msg = [
        `Imported ${txs.length} new transaction(s).`,
        errors.length ? `${errors.length} invalid row(s) skipped.` : "",
        valid.length !== deduped.length
          ? `${valid.length - deduped.length} duplicate(s) skipped.`
          : "",
      ]
        .filter(Boolean)
        .join(" ");

      alert(msg || "No rows imported.");
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        onClick={onExport}
        className="px-3 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500"
      >
        Export CSV (filtered)
      </button>
      <label className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:text-white cursor-pointer inline-flex items-center gap-2">
        <span>Import CSV</span>
        <input type="file" accept=".csv,text/csv" onChange={onImport} className="hidden" />
      </label>
    </div>
  );
}
