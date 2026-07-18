"use client"
import { useState } from "react"
import Link from "next/link"

type Result = {
    type: string
    id: string
    title: string
    courseId: string
}

export default function SearchBar() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Result[]>([])
    const [loading, setLoading] = useState(false)
    const [showResults, setShowResults] = useState(false)

    const handleSearch = async (value: string) => {
        setQuery(value)

        if (value.trim().length < 2) {
            setResults([])
            setShowResults(false)
            return
        }

        setLoading(true)
        setShowResults(true)

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
            const data = await res.json()
            setResults(data.results || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="relative mb-8">
            <input
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 150)}
                placeholder="Search chapters, topics, lessons..."
                className="w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm outline-none focus:border-zinc-500 bg-white"
            />

            {showResults && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-zinc-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                    {loading && (
                        <p className="p-4 text-sm text-zinc-400">Searching...</p>
                    )}

                    {!loading && results.length === 0 && (
                        <p className="p-4 text-sm text-zinc-400">No results found.</p>
                    )}

                    {!loading &&
                        results.map((r) => (
                            <Link
                                key={`${r.type}-${r.id}`}
                                href={`/course/${r.courseId}`}
                                className="block px-4 py-3 hover:bg-zinc-50 border-b border-zinc-100 last:border-0"
                            >
                                <span className="text-xs uppercase text-zinc-400 mr-2">{r.type}</span>
                                <span className="text-sm text-zinc-800">{r.title}</span>
                            </Link>
                        ))}
                </div>
            )}
        </div>
    )
}