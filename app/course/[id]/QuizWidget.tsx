"use client"
import { useState } from "react"

type Question = {
    type: string
    question: string
    options: string[]
    correct_answer: string
    explanation: string
}

export default function QuizWidget({ chapterId }: { chapterId: string }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [questions, setQuestions] = useState<Question[]>([])
    const [answers, setAnswers] = useState<Record<number, string>>({})
    const [submitted, setSubmitted] = useState(false)
    const [score, setScore] = useState(0)

    const startQuiz = async () => {
        setOpen(true)
        setLoading(true)
        setSubmitted(false)
        setAnswers({})
        setQuestions([])

        try {
            const res = await fetch("/api/generate-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chapterId }),
            })
            const data = await res.json()
            setQuestions(data.questions || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const selectAnswer = (qIndex: number, option: string) => {
        if (submitted) return
        setAnswers((prev) => ({ ...prev, [qIndex]: option }))
    }

    const submitQuiz = async () => {
        let correctCount = 0
        questions.forEach((q, i) => {
            if (answers[i] === q.correct_answer) correctCount++
        })
        const finalScore = Math.round((correctCount / questions.length) * 100)
        setScore(finalScore)
        setSubmitted(true)

        try {
            await fetch("/api/quiz-attempts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chapterId,
                    score: finalScore,
                    answers,
                }),
            })
        } catch (err) {
            console.error("Failed to save quiz attempt", err)
        }
    }

    return (
        <div className="mt-2">
            <button
                onClick={startQuiz}
                className="bg-[var(--accent)] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
                Take Quiz
            </button>

            {open && (
                <div className="mt-4 bg-[var(--surface-2)] border border-[var(--border)] rounded-xl p-5">
                    {loading && <p className="text-[var(--ink-muted)] text-sm">Generating quiz...</p>}

                    {!loading && questions.length === 0 && (
                        <p className="text-red-500 text-sm">Could not generate quiz. Try again.</p>
                    )}

                    {!loading && questions.length > 0 && (
                        <div className="space-y-6">
                            {questions.map((q, i) => (
                                <div key={i}>
                                    <p className="font-semibold mb-2 text-[var(--ink)]">
                                        {i + 1}. {q.question}
                                    </p>
                                    <div className="space-y-1">
                                        {q.options.map((opt, oi) => {
                                            const isSelected = answers[i] === opt
                                            const isCorrect = opt === q.correct_answer
                                            let optionClass = "border-[var(--border)]"
                                            if (submitted) {
                                                if (isCorrect) optionClass = "border-green-500 bg-green-500/10"
                                                else if (isSelected && !isCorrect) optionClass = "border-red-500 bg-red-500/10"
                                            } else if (isSelected) {
                                                optionClass = "border-[var(--primary)] bg-[var(--primary)]/10"
                                            }
                                            return (
                                                <label
                                                    key={oi}
                                                    className={`flex items-center gap-2 border rounded-lg px-3 py-2 text-sm cursor-pointer text-[var(--ink)] ${optionClass}`}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={`q-${i}`}
                                                        checked={isSelected}
                                                        onChange={() => selectAnswer(i, opt)}
                                                        disabled={submitted}
                                                        className="accent-[var(--primary)]"
                                                    />
                                                    {opt}
                                                </label>
                                            )
                                        })}
                                    </div>
                                    {submitted && (
                                        <p className="text-xs text-[var(--ink-muted)] mt-2">
                                            <b>Explanation:</b> {q.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}

                            {!submitted ? (
                                <button
                                    onClick={submitQuiz}
                                    disabled={Object.keys(answers).length !== questions.length}
                                    className="bg-[var(--primary)] text-white px-5 py-2 rounded-lg text-sm hover:bg-[var(--primary-hover)] disabled:opacity-40"
                                >
                                    Submit Quiz
                                </button>
                            ) : (
                                <div className="font-semibold text-lg text-[var(--ink)]">
                                    Your Score: {score}%
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}