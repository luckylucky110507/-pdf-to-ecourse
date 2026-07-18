import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { supabase } from "@/app/lib/supabase"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not logged in" }, { status: 401 })
        }

        const { message, courseId, lessonContext, courseTitle } = await req.json()

        if (!message || !courseId) {
            return NextResponse.json({ error: "Missing message or courseId" }, { status: 400 })
        }

        // Get internal user id
        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Fetch recent chat history for this course
        const { data: history } = await supabase
            .from("chat_history")
            .select("role, content")
            .eq("user_id", dbUser.id)
            .eq("course_id", courseId)
            .order("created_at", { ascending: true })
            .limit(20)

        const messages: any[] = [
            {
                role: "system",
                content: `You are a helpful learning assistant for an online course titled "${courseTitle || "this course"}". Answer clearly and simply. ${lessonContext ? `Current lesson context: ${lessonContext}` : ""
                    }`,
            },
            ...(history || []).map((h) => ({ role: h.role, content: h.content })),
            { role: "user", content: message },
        ]

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages,
        })

        const aiReply = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response."

        // Save both messages to chat_history
        await supabase.from("chat_history").insert([
            { user_id: dbUser.id, course_id: courseId, role: "user", content: message },
            { user_id: dbUser.id, course_id: courseId, role: "assistant", content: aiReply },
        ])

        return NextResponse.json({ reply: aiReply })
    } catch (error) {
        console.error("Chat error:", error)
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 })
    }
}