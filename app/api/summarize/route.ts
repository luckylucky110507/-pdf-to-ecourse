import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const { courseId } = await req.json()

        if (!courseId) {
            return NextResponse.json({ error: "Missing courseId" }, { status: 400 })
        }

        const { data: course } = await supabase
            .from("courses")
            .select("title, description")
            .eq("id", courseId)
            .single()

        const { data: chapters } = await supabase
            .from("chapters")
            .select(`
        title,
        topics (
          title,
          lessons ( title, content )
        )
      `)
            .eq("course_id", courseId)

        const chapterTitles = (chapters || [])
            .map((ch: any) => `- ${ch.title}: ${(ch.topics || []).map((t: any) => t.title).join(", ")}`)
            .join("\n")

        const lessonSnippets = (chapters || [])
            .flatMap((ch: any) => ch.topics || [])
            .flatMap((t: any) => t.lessons || [])
            .map((l: any) => l.content)
            .join(" ")
            .slice(0, 8000)

        const prompt = `Summarize this course in a concise, well-structured way for a student who wants a quick overview before starting.

Course: ${course?.title}
Description: ${course?.description}

Chapters:
${chapterTitles}

Content excerpt:
${lessonSnippets}

Write a summary with:
1. A 2-3 sentence overview of what the course covers
2. 4-6 key takeaways as bullet points
3. Who this course is best suited for (1 sentence)

Keep it concise and scannable. Do not use markdown headers, just plain text with clear paragraph breaks and "- " for bullets.`

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
        })

        const summary = completion.choices[0]?.message?.content || "Could not generate summary."

        return NextResponse.json({ summary })
    } catch (error) {
        console.error("Summarize error:", error)
        return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 })
    }
}