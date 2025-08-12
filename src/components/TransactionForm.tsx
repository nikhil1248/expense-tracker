import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "../store";

const today = new Date().toISOString().slice(0, 10);

const schema = z.object({
  amount: z.preprocess(
    (v) => (typeof v === "string" ? v.trim() : v),
    z.string().min(1, "Amount required").refine((s) => !isNaN(Number(s)), "Amount must be a number")
  ).transform((s) => Number(s))
   .refine((n) => n > 0, "Amount must be > 0"),
  date: z.string().min(1, "Date required").refine((d) => d <= today, "Date cannot be in the future"),
  category: z.string().min(1, "Category required"),
  type: z.enum(["income", "expense"], { message: "Type required" }),
  note: z.string().optional().transform((s) => (s ? s.trim() : s)),
});

type FormData = z.infer<typeof schema>;

export default function TransactionForm() {
  const addTx = useAppStore((s) => s.addTx);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting, isValid } } =
    useForm<FormData>({
      resolver: zodResolver(schema),
      mode: "onChange",
      defaultValues: { amount: 0, date: today, type: "expense", category: "Food", note: "" },
    });

  const onSubmit = (data: FormData) => {
    addTx({
      amount: Math.round(data.amount * 100),
      date: data.date,
      category: data.category,
      type: data.type,
      note: data.note,
    });
    reset({ amount: 0, date: today, type: "expense", category: "Food", note: "" });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow flex flex-wrap gap-3">
      <div>
        <input type="number" step="0.01" placeholder="Amount" {...register("amount")}
               className="p-2 border rounded w-32" />
        {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
      </div>

      <div>
        <input type="date" max={today} {...register("date")}
               className="p-2 border rounded" />
        {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
      </div>

      <div>
        <select {...register("category")} className="p-2 border rounded">
          <option>Food</option><option>Rent</option><option>Transport</option>
          <option>Shopping</option><option>Bills</option><option>Health</option>
          <option>Salary</option><option>Other</option>
        </select>
        {errors.category && <p className="text-xs text-red-600 mt-1">{errors.category.message}</p>}
      </div>

      <div>
        <select {...register("type")} className="p-2 border rounded">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        {errors.type && <p className="text-xs text-red-600 mt-1">{errors.type.message}</p>}
      </div>

      <input type="text" placeholder="Note" {...register("note")} className="p-2 border rounded flex-1" />

      <button disabled={!isValid || isSubmitting}
              className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed">
        Add
      </button>
    </form>
  );
}
