import { useEffect } from "react";
import { useAppStore } from "../store";

export default function DarkModeToggle() {
  const { settings, setSettings } = useAppStore();
  useEffect(() => {
    const root = document.documentElement;
    settings.darkMode ? root.classList.add("dark") : root.classList.remove("dark");
  }, [settings.darkMode]);
  return (
    <button
      onClick={() => setSettings({ darkMode: !settings.darkMode })}
      className="px-3 py-2 rounded border bg-white dark:bg-gray-800 dark:text-white"
    >
      {settings.darkMode ? "☀ Light" : "🌙 Dark"}
    </button>
  );
}


