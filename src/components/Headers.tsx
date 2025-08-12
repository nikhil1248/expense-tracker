import DarkModeToggle from "./DarkModeToggle";
import CurrencySelect from "./CurrencySelect";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center gap-3">
        <h1 className="text-xl font-semibold text-indigo-600 dark:text-indigo-400">
          Expense Tracker
        </h1>
        <div className="ml-auto flex items-center gap-3">
          <CurrencySelect />
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
