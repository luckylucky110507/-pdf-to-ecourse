"use client"
import { useState } from "react"

export default function SummaryWidget({ courseId }: { courseId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [summary, setSummary] = useState<string | null>(null)

    const generateSummary = async () => {
        setOpen(true)
        if (summary) return // already generated, just reopen

        setLoading(true)
        try {
            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseId }),
            })
            const data = await res.json()
            setSummary(data.summary || "Could not generate summary.")
        } catch (err) {
            setSummary("Failed to generate summary.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mb-6">
            <button
                onClick={generateSummary}
                className="bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-[var(--surface-2)] transition-colors inline-flex items-center gap-2"
            >
                📄 Summarize Course
            </button>

            {open && (
                <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6">
                    {loading ? (
                        <p className="text-[var(--ink-muted)] text-sm">Generating summary...</p>
                    ) : (
                        <div className="text-[var(--ink)] text-sm leading-relaxed whitespace-pre-line">
                            {summary}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}