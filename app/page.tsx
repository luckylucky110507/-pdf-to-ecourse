"use client"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import ThemeToggle from "./ThemeToggle"

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg)]">
      <div className="p-6 flex justify-end">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)] font-semibold mb-3">
            PDF to eCourse
          </p>
          <h1 className="text-5xl font-bold text-[var(--ink)] mb-4 leading-tight">
            Turn any document into a course
          </h1>
          <p className="text-[var(--ink-muted)] mb-10">
            Upload a PDF and let AI structure it into chapters, lessons, quizzes, and a tutor that answers your questions.
          </p>

          {session ? (
            <div className="space-y-3">
              <p className="text-sm text-[var(--ink-muted)] mb-4">
                Signed in as {session.user?.email}
              </p>
              <Link href="/dashboard">
                <button className="w-full bg-[var(--primary)] text-white font-medium px-6 py-3.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors">
                  Go to Dashboard
                </button>
              </Link>
              <Link href="/upload">
                <button className="w-full bg-[var(--surface)] border border-[var(--border)] text-[var(--ink)] font-medium px-6 py-3.5 rounded-xl hover:bg-[var(--surface-2)] transition-colors">
                  Upload a PDF
                </button>
              </Link>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="bg-[var(--primary)] text-white font-medium px-8 py-3.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-2"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </div>
  )
}