"use client"
import { useState, useRef, useEffect } from "react"

export default function ChatWidget({
    courseId,
    courseTitle,
    lessonContext,
}: {
    courseId: string
    courseTitle?: string
    lessonContext?: string
}) {
    const [open, setOpen] = useState(false)
    const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, open])

    const sendMessage = async () => {
        if (!input.trim() || loading) return

        const userMsg = { role: "user", content: input }
        setMessages((prev) => [...prev, userMsg])
        setInput("")
        setLoading(true)

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.content,
                    courseId,
                    courseTitle,
                    lessonContext,
                }),
            })
            const data = await res.json()

            if (data.reply) {
                setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
            } else {
                setMessages((prev) => [...prev, { role: "assistant", content: "Error: " + (data.error || "Unknown") }])
            }
        } catch (err) {
            setMessages((prev) => [...prev, { role: "assistant", content: "Failed to reach the server." }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            {/* Floating toggle button */}
            <button
                onClick={() => setOpen(!open)}
                className="fixed bottom-6 right-6 bg-black text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-zinc-800 transition-colors z-50"
            >
                {open ? "✕" : "💬"}
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-24 right-6 w-96 max-w-[90vw] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border border-zinc-200">
                    <div className="px-4 py-3 border-b border-zinc-200 font-semibold text-zinc-900">
                        Ask the AI Tutor
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                        {messages.length === 0 && (
                            <p className="text-sm text-zinc-400">
                                Ask anything about this course — explain a concept, summarize a chapter, or suggest what to study next.
                            </p>
                        )}
                        {messages.map((m, i) => (
                            <div
                                key={i}
                                className={`text-sm rounded-xl px-3 py-2 max-w-[85%] ${m.role === "user"
                                        ? "bg-black text-white ml-auto"
                                        : "bg-zinc-100 text-zinc-800"
                                    }`}
                            >
                                {m.content}
                            </div>
                        ))}
                        {loading && (
                            <div className="text-sm text-zinc-400">Thinking...</div>
                        )}
                        <div ref={bottomRef} />
                    </div>

                    <div className="p-3 border-t border-zinc-200 flex gap-2">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                            placeholder="Type your question..."
                            className="flex-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-zinc-500"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={loading}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-zinc-800 disabled:bg-zinc-300"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}