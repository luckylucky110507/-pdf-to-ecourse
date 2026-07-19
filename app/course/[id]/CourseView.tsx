"use client";

import { useState } from "react";
import Link from "next/link";
import ChatWidget from "./ChatWidget";
import QuizWidget from "./QuizWidget";
import SummaryWidget from "./SummaryWidget";
import ThemeToggle from "../../ThemeToggle";

export default function CourseView({
    course,
    chapters,
    initialProgress,
    isLoggedIn,
}: {
    course: any;
    chapters: any[];
    initialProgress: Record<string, boolean>;
    isLoggedIn: boolean;
}) {
    const [openTopic, setOpenTopic] = useState<string | null>(null);
    const [progress, setProgress] = useState<Record<string, boolean>>(initialProgress);
    const [saving, setSaving] = useState<string | null>(null);

    const toggleTopic = (topicId: string) => {
        setOpenTopic(openTopic === topicId ? null : topicId);
    };

    const toggleLessonComplete = async (lessonId: string) => {
        if (!isLoggedIn) {
            alert("Please log in to track progress.");
            return;
        }

        const newValue = !progress[lessonId];
        setProgress((prev) => ({ ...prev, [lessonId]: newValue }));
        setSaving(lessonId);

        try {
            const res = await fetch("/api/progress", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ lessonId, completed: newValue }),
            });

            if (!res.ok) throw new Error("Failed to save progress");
        } catch (err) {
            console.error(err);
            setProgress((prev) => ({ ...prev, [lessonId]: !newValue }));
            alert("Failed to save progress. Try again.");
        } finally {
            setSaving(null);
        }
    };

    const allLessons = chapters.flatMap((ch) =>
        ch.topics.flatMap((t: any) => t.lessons || [])
    );
    const completedCount = allLessons.filter((l) => progress[l.id]).length;
    const completionPercent =
        allLessons.length > 0
            ? Math.round((completedCount / allLessons.length) * 100)
            : 0;

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <div className="max-w-5xl mx-auto p-8">

                <div className="flex justify-between items-start mb-6">
                    <Link href="/dashboard" className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]">
                        ← Back to dashboard
                    </Link>
                    <ThemeToggle />
                </div>

                <h1 className="text-4xl font-bold mb-4 text-[var(--ink)]">
                    {course?.title}
                </h1>

                <p className="text-lg text-[var(--ink-muted)] mb-6">
                    {course?.description}
                </p>

                {/* Progress bar */}
                <div className="mb-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
                    <div className="flex justify-between text-sm font-semibold mb-2 text-[var(--ink)]">
                        <span>Course Progress</span>
                        <span>{completionPercent}% ({completedCount}/{allLessons.length})</span>
                    </div>
                    <div className="w-full bg-[var(--surface-2)] rounded-full h-3">
                        <div
                            className="bg-[var(--primary)] h-3 rounded-full transition-all"
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>
                </div>

                <SummaryWidget courseId={course?.id} />

                <h2 className="text-3xl font-bold mb-6 text-[var(--ink)]">
                    Chapters
                </h2>

                {chapters && chapters.length > 0 ? (
                    chapters.map((chapter: any, index: number) => (
                        <div
                            key={chapter.id}
                            className="bg-[var(--surface)] border border-[var(--border)] shadow-sm rounded-2xl p-6 mb-6"
                        >
                            <p className="text-xs uppercase tracking-wider text-[var(--accent)] font-semibold mb-1">
                                Chapter {index + 1}
                            </p>
                            <h3 className="text-2xl font-semibold mb-4 text-[var(--ink)]">
                                {chapter.title}
                            </h3>

                            <QuizWidget chapterId={chapter.id} />

                            {chapter.topics && chapter.topics.length > 0 ? (
                                chapter.topics.map((topic: any, topicIndex: number) => (
                                    <div
                                        key={topic.id}
                                        className="border border-[var(--border)] rounded-xl p-4 mb-4 mt-4"
                                    >
                                        <button
                                            onClick={() => toggleTopic(topic.id)}
                                            className="w-full text-left"
                                        >
                                            <h4 className="text-xl font-semibold flex justify-between items-center text-[var(--ink)]">
                                                <span>{topicIndex + 1}. {topic.title}</span>
                                                <span className="text-sm text-[var(--primary)]">
                                                    {openTopic === topic.id ? "Hide Lessons ▲" : "Show Lessons ▼"}
                                                </span>
                                            </h4>

                                            <p className="mt-2 text-[var(--ink-muted)]">
                                                {topic.summary}
                                            </p>
                                        </button>

                                        {openTopic === topic.id && (
                                            <div className="mt-4 space-y-4">
                                                {topic.lessons && topic.lessons.length > 0 ? (
                                                    topic.lessons.map((lesson: any) => (
                                                        <div
                                                            key={lesson.id}
                                                            className="bg-[var(--surface-2)] border-l-4 border-[var(--primary)] p-4 rounded-lg"
                                                        >
                                                            <div className="flex items-start justify-between gap-4">
                                                                <h5 className="font-bold text-lg mb-2 text-[var(--ink)]">
                                                                    {lesson.title}
                                                                </h5>

                                                                <label className="flex items-center gap-2 text-sm whitespace-nowrap cursor-pointer text-[var(--ink)]">
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={!!progress[lesson.id]}
                                                                        onChange={() => toggleLessonComplete(lesson.id)}
                                                                        disabled={saving === lesson.id}
                                                                        className="w-4 h-4 accent-[var(--primary)]"
                                                                    />
                                                                    {saving === lesson.id
                                                                        ? "Saving..."
                                                                        : progress[lesson.id]
                                                                            ? "Completed"
                                                                            : "Mark Complete"}
                                                                </label>
                                                            </div>

                                                            <p className="text-[var(--ink)] mb-3">
                                                                {lesson.content}
                                                            </p>

                                                            {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
                                                                <div>
                                                                    <p className="font-semibold text-sm text-[var(--ink-muted)] mb-1">
                                                                        Key Takeaways:
                                                                    </p>
                                                                    <ul className="list-disc list-inside text-sm text-[var(--ink-muted)]">
                                                                        {lesson.key_takeaways.map((point: string, i: number) => (
                                                                            <li key={i}>{point}</li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-red-500">No Lessons Found</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-red-500">
                                    No Topics Found
                                </p>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-red-500 text-xl">
                        No Chapters Found
                    </p>
                )}

            </div>
            <ChatWidget courseId={course?.id} courseTitle={course?.title} />
        </div>
    );
}