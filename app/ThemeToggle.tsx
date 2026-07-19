"use client"
import { useTheme } from "./ThemeProvider"

export default function ThemeToggle() {
    const { dark, toggle } = useTheme()

    return (
        <button
            onClick={toggle}
            className="w-10 h-10 rounded-full flex items-center justify-center border transition-colors"
            style={{ borderColor: "var(--border)", color: "var(--ink)" }}
            aria-label="Toggle dark mode"
        >
            {dark ? "☀️" : "🌙"}
        </button>
    )
}