import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/app/lib/supabase"
import Groq from "groq-sdk"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
    try {
        const { chapterId } = await req.json()

        if (!chapterId) {
            return NextResponse.json({ error: "Missing chapterId" }, { status: 400 })
        }

        // Fetch chapter + its topics + lessons for context
        const { data: chapter, error } = await supabase
            .from("chapters")
            .select(`
        *,
        topics (
          *,
          lessons (*)
        )
      `)
            .eq("id", chapterId)
            .single()

        if (error || !chapter) {
            return NextResponse.json({ error: "Chapter not found" }, { status: 404 })
        }

        // Build a text summary of the chapter content for the prompt
        const lessonTexts = chapter.topics
            ?.flatMap((t: any) => t.lessons || [])
            .map((l: any) => `${l.title}: ${l.content}`)
            .join("\n\n")
            .slice(0, 6000) // keep prompt size reasonable

        const prompt = `Based on the following chapter content, generate 5 quiz questions (mix of Multiple Choice and True/False).

Chapter: ${chapter.title}

Content:
${lessonTexts}

Return ONLY valid JSON, no markdown fences, in this exact format:
{
  "questions": [
    {
      "type": "mcq",
      "question": "",
      "options": ["", "", "", ""],
      "correct_answer": "",
      "explanation": ""
    },
    {
      "type": "true_false",
      "question": "",
      "options": ["True", "False"],
      "correct_answer": "",
      "explanation": ""
    }
  ]
}`

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
        })

        let raw = completion.choices[0]?.message?.content || "{}"
        raw = raw.replace(/```json|```/g, "").trim()

        let quizData
        try {
            quizData = JSON.parse(raw)
        } catch (e) {
            return NextResponse.json({ error: "Failed to parse quiz JSON" }, { status: 500 })
        }

        return NextResponse.json({ questions: quizData.questions || [] })
    } catch (error) {
        console.error("Quiz generation error:", error)
        return NextResponse.json({ error: "Failed to generate quiz" }, { status: 500 })
    }
}