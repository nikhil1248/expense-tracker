import { useState } from "react";
import { useAppStore } from "../store";
import type { Transaction } from "../store";
import { formatMoney } from "../lib/money";
import EditTransactionModal from "./EditTransactionModal";

export default function TransactionTable() {
  const { transactions, deleteTx, settings } = useAppStore();
  const [editing, setEditing] = useState<Transaction | null>(null);

  return (
    <>
      <div className="bg-white rounded-lg shadow mt-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Date</th>
              <th className="p-2">Type</th>
              <th className="p-2">Category</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="p-2">{t.date}</td>
                <td className="p-2">{t.type}</td>
                <td className="p-2">{t.category}</td>
                <td className="p-2 text-right">{formatMoney(t.amount, settings.currency)}</td>
                <td className="p-2 text-center space-x-3">
                  <button onClick={() => setEditing(t)} className="text-indigo-600 hover:underline">
                    Edit
                  </button>
                  <button onClick={() => deleteTx(t.id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">No transactions yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditTransactionModal
        open={!!editing}
        onClose={() => setEditing(null)}
        tx={editing}
      />
    </>
  );
}
