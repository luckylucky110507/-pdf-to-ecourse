"use client"
import { signIn, useSession } from "next-auth/react"
import Link from "next/link"

export default function Home() {
  const { data: session } = useSession()

  if (session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-zinc-50 px-4">
        <h1 className="text-xl font-medium text-zinc-900">
          Logged in as {session.user?.email}
        </h1>
        <Link href="/dashboard">
          <button className="bg-black text-white font-medium px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors">
            Go to Dashboard
          </button>
        </Link>
        <Link href="/upload">
          <button className="bg-white border border-zinc-300 text-zinc-900 font-medium px-6 py-3 rounded-xl hover:bg-zinc-100 transition-colors">
            Upload PDF
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <button
        onClick={() => signIn("google")}
        className="bg-black text-white font-medium px-6 py-3 rounded-xl hover:bg-zinc-800 transition-colors"
      >
        Sign in with Google
      </button>
    </div>
  )
}