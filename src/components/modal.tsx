import type { ReactNode } from "react";

export default function Modal({ open, onClose, children }: {
  open: boolean; onClose: () => void; children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 bg-white rounded-xl shadow-xl p-4 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
