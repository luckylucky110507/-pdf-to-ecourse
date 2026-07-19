"use client"
import { useState } from "react"
import Link from "next/link"
import ThemeToggle from "../ThemeToggle"

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState<any>(null)

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        setResult(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()
            setResult(data)
        } catch (err) {
            setResult({ error: "Upload failed" })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-[var(--bg)] flex flex-col">
            <div className="p-6 flex justify-between items-center">
                <Link href="/dashboard" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
                    ← Back to dashboard
                </Link>
                <ThemeToggle />
            </div>

            <div className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm p-8">
                    <p className="text-xs uppercase tracking-wider text-[var(--accent)] font-semibold mb-2">Step 1</p>
                    <h1 className="text-2xl font-bold text-[var(--ink)] mb-6">Upload your PDF</h1>

                    <label className="block border-2 border-dashed border-[var(--border)] rounded-xl p-6 text-center cursor-pointer hover:border-[var(--primary)] transition-colors">
                        <input
                            type="file"
                            accept=".pdf"
                            className="hidden"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                        />
                        <span className="text-[var(--ink-muted)]">
                            {file ? file.name : "Click to select a PDF file"}
                        </span>
                    </label>

                    <button
                        onClick={handleUpload}
                        disabled={!file || loading}
                        className="mt-5 w-full bg-[var(--primary)] text-white font-medium py-3 rounded-xl transition-colors hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? "Uploading..." : "Upload"}
                    </button>

                    {result && (
                        <div className="mt-6 border-t border-[var(--border)] pt-4">
                            {result.error ? (
                                <p className="text-red-500 text-sm">{result.error}</p>
                            ) : (
                                <div className="space-y-2 text-sm text-[var(--ink)]">
                                    <p><span className="font-semibold">Title:</span> {result.title}</p>
                                    <p><span className="font-semibold">Text length:</span> {result.fullTextLength}</p>
                                    <p className="text-[var(--ink-muted)] line-clamp-4">
                                        <span className="font-semibold text-[var(--ink)]">Preview:</span> {result.textPreview}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}