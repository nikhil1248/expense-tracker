import { useAppStore } from "../store";
import type { Settings } from "../store";


export default function CurrencySelect() {
  const { settings, setSettings } = useAppStore();
  return (
    <select
      value={settings.currency}
      onChange={(e) => setSettings({ currency: e.target.value as Settings["currency"] })}
      className="p-2 border rounded bg-white dark:bg-gray-800 dark:text-white"
    >
      {(["USD","CAD","EUR","INR"] as const).map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );
}