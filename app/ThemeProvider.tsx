"use client"
import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext<{ dark: boolean; toggle: () => void }>({
    dark: false,
    toggle: () => { },
})

export function useTheme() {
    return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [dark, setDark] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem("theme")
        const isDark = stored === "dark"
        setDark(isDark)
        document.documentElement.classList.toggle("dark", isDark)
    }, [])

    const toggle = () => {
        setDark((prev) => {
            const next = !prev
            localStorage.setItem("theme", next ? "dark" : "light")
            document.documentElement.classList.toggle("dark", next)
            return next
        })
    }

    return (
        <ThemeContext.Provider value={{ dark, toggle }}>
            {children}
        </ThemeContext.Provider>
    )
}