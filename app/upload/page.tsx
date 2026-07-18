"use client"

import { useState } from "react"

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
            // Step 1: Upload PDF
            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            const uploadData = await uploadRes.json()

            if (uploadData.error) {
                setResult(uploadData)
                return
            }

            // Step 2: Generate AI Course
            const courseRes = await fetch("/api/generate-course", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    documentId: uploadData.documentId,
                }),
            })

            const courseData = await courseRes.json()

            setResult({
                ...uploadData,
                aiCourse: courseData,
            })

        } catch (err) {
            console.error(err)
            setResult({
                error: "Something went wrong",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
                <h1 className="text-2xl font-semibold text-zinc-900 mb-6">
                    Upload PDF
                </h1>

                <label className="block border-2 border-dashed border-zinc-300 rounded-xl p-6 text-center cursor-pointer hover:border-zinc-400 transition-colors">
                    <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                    />
                    <span className="text-zinc-600">
                        {file ? file.name : "Click to select a PDF file"}
                    </span>
                </label>

                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    className="mt-5 w-full bg-black text-white font-medium py-3 rounded-xl transition-colors hover:bg-zinc-800 disabled:bg-zinc-300 disabled:cursor-not-allowed"
                >
                    {loading ? "Uploading..." : "Upload"}
                </button>

                {result && (
                    <div className="mt-6 border-t border-zinc-200 pt-4">
                        {result.error ? (
                            <p className="text-red-600 text-sm">
                                {result.error}
                            </p>
                        ) : (
                            <div className="space-y-2 text-sm text-zinc-700">
                                <p>
                                    <span className="font-semibold">
                                        Title:
                                    </span>{" "}
                                    {result.title}
                                </p>

                                <p>
                                    <span className="font-semibold">
                                        Text length:
                                    </span>{" "}
                                    {result.fullTextLength}
                                </p>

                                <p className="text-zinc-500 line-clamp-4">
                                    <span className="font-semibold text-zinc-700">
                                        Preview:
                                    </span>{" "}
                                    {result.textPreview}
                                </p>

                                {result.aiCourse && (
                                    <div className="mt-4 rounded-lg bg-green-100 p-3">
                                        <p className="font-semibold text-green-700">
                                            ✅ AI Course Generated Successfully
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}