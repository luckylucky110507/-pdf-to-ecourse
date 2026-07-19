"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "../ThemeToggle"

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<string>("")
    const [result, setResult] = useState<any>(null)
    const router = useRouter()

    const handleUpload = async () => {
        if (!file) return
        setLoading(true)
        setResult(null)
        setStatus("Uploading PDF...")

        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })
            const data = await res.json()

            if (data.error) {
                setResult({ error: data.error })
                setLoading(false)
                setStatus("")
                return
            }

            setResult(data)
            setStatus("Generating your course with AI... this may take a moment")

            // Now trigger course generation
            const genRes = await fetch("/api/generate-course", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId: data.documentId }),
            })
            const genData = await genRes.json()

            if (genData.error) {
                setResult({ error: genData.error })
                setLoading(false)
                setStatus("")
                return
            }

            setStatus("Course ready! Redirecting...")
            router.push(`/course/${genData.courseId}`)

        } catch (err) {
            setResult({ error: "Upload failed" })
            setStatus("")
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
                        {loading ? "Processing..." : "Upload"}
                    </button>

                    {status && (
                        <p className="mt-4 text-sm text-[var(--ink-muted)] text-center">{status}</p>
                    )}

                    {result?.error && (
                        <div className="mt-6 border-t border-[var(--border)] pt-4">
                            <p className="text-red-500 text-sm">{result.error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}