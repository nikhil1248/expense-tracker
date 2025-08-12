// src/lib/csv.ts
import { z } from "zod";
import type { Transaction } from "../store";

const HEADERS = ["date", "type", "category", "amount_cents", "note"] as const;

// --- CSV helpers -------------------------------------------------------------

const escape = (s: string) =>
  /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;

/** Build a CSV string from transactions (amount is in cents). */
export function toCSV(rows: Transaction[]): string {
  const lines = [
    HEADERS.join(","),
    ...rows.map((r) =>
      [
        r.date,
        r.type,
        r.category,
        String(r.amount), // cents
        r.note ?? "",
      ]
        .map((v) => escape(String(v)))
        .join(",")
    ),
  ];
  return lines.join("\n");
}

// Split on commas not inside quotes
const CSV_SPLIT = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/;

// --- Types & validation ------------------------------------------------------

export const rowSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "date must be YYYY-MM-DD"),
  type: z.enum(["income", "expense"]),
  category: z.string().min(1),
  amount_cents: z.coerce.number().int().nonnegative(),
  note: z.string().optional(),
});

export type CsvRow = z.infer<typeof rowSchema>;

/** Parse CSV text to rows (no side effects). */
export function parseCSV(text: string): CsvRow[] {
  const [headerLine, ...rest] = text.trim().split(/\r?\n/);
  if (!headerLine) return [];

  const header = headerLine
    .split(CSV_SPLIT)
    .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());

  const idx = (name: string) => header.indexOf(name);
  const iDate = idx("date");
  const iType = idx("type");
  const iCat = idx("category");
  const iAmt = idx("amount_cents");
  const iNote = idx("note");

  if ([iDate, iType, iCat, iAmt].some((i) => i < 0)) {
    throw new Error(`CSV must include headers: ${HEADERS.join(",")}`);
  }

  const rows: CsvRow[] = [];
  for (const line of rest) {
    if (!line.trim()) continue;
    const cols = line.split(CSV_SPLIT).map((c) => c.replace(/^"|"$/g, ""));
    rows.push({
      date: cols[iDate],
      type: cols[iType] as "income" | "expense",
      category: cols[iCat],
      amount_cents: Number(cols[iAmt]),
      note: iNote >= 0 ? cols[iNote] : undefined,
    });
  }
  return rows;
}

// --- download helper ---------------------------------------------------------

export function download(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
