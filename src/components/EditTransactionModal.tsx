import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { useAppStore } from "../store";
import type { Transaction } from "../store";
import Modal from "./modal";

export default function EditTransactionModal({
  open, onClose, tx,
}: { open: boolean; onClose: () => void; tx: Transaction | null; }) {
  const updateTx = useAppStore(s => s.updateTx);
  const { register, handleSubmit, reset } = useForm({
    defaultValues: tx ?? { amount: 0, date: "", category: "Food", type: "expense", note: "" }
  });

  // whenever tx changes, load it into the form
  useEffect(() => {
    if (tx) {
      reset({
        ...tx,
        amount: (tx.amount / 100).toFixed(2) as any, // show dollars in input
      });
    }
  }, [tx, reset]);

  const onSubmit = (data: any) => {
    if (!tx) return;
    updateTx({
      id: tx.id,
      amount: Math.round(parseFloat(data.amount) * 100),
      date: data.date,
      category: data.category,
      type: data.type,
      note: data.note,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="text-lg font-semibold mb-3">Edit Transaction</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-3">
        <input type="number" step="0.01" placeholder="Amount" {...register("amount")}
               className="p-2 border rounded" />
        <input type="date" {...register("date")} className="p-2 border rounded" />
        <select {...register("category")} className="p-2 border rounded col-span-1">
          <option>Food</option><option>Rent</option><option>Transport</option><option>Shopping</option>
          <option>Bills</option><option>Health</option><option>Salary</option><option>Other</option>
        </select>
        <select {...register("type")} className="p-2 border rounded">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input placeholder="Note" {...register("note")} className="p-2 border rounded col-span-2" />
        <div className="col-span-2 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border">Cancel</button>
          <button className="px-3 py-2 rounded bg-indigo-600 text-white">Save</button>
        </div>
      </form>
    </Modal>
  );
}
