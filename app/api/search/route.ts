import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { supabase } from "@/app/lib/supabase"

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not logged in" }, { status: 401 })
        }

        const searchTerm = req.nextUrl.searchParams.get("q")
        if (!searchTerm || searchTerm.trim().length === 0) {
            return NextResponse.json({ results: [] })
        }

        // Search lessons by title (also grab topic -> chapter -> course info)
        const { data: lessons } = await supabase
            .from("lessons")
            .select(`
        id,
        title,
        topic_id,
        topics (
          id,
          title,
          chapter_id,
          chapters (
            id,
            title,
            course_id
          )
        )
      `)
            .ilike("title", `%${searchTerm}%`)
            .limit(10)

        // Search topics by title
        const { data: topics } = await supabase
            .from("topics")
            .select(`
        id,
        title,
        chapter_id,
        chapters (
          id,
          title,
          course_id
        )
      `)
            .ilike("title", `%${searchTerm}%`)
            .limit(10)

        // Search chapters by title
        const { data: chapters } = await supabase
            .from("chapters")
            .select("id, title, course_id")
            .ilike("title", `%${searchTerm}%`)
            .limit(10)

        const results = [
            ...(chapters || []).map((c: any) => ({
                type: "chapter",
                id: c.id,
                title: c.title,
                courseId: c.course_id,
            })),
            ...(topics || []).map((t: any) => ({
                type: "topic",
                id: t.id,
                title: t.title,
                courseId: t.chapters?.course_id,
            })),
            ...(lessons || []).map((l: any) => ({
                type: "lesson",
                id: l.id,
                title: l.title,
                courseId: l.topics?.chapters?.course_id,
            })),
        ]

        return NextResponse.json({ results })
    } catch (error) {
        console.error("Search error:", error)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }
}