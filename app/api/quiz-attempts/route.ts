import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { supabase } from "@/app/lib/supabase"

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not logged in" }, { status: 401 })
        }

        const { chapterId, score, answers } = await req.json()

        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single()

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const { error } = await supabase.from("quiz_attempts").insert({
            user_id: dbUser.id,
            chapter_id: chapterId,
            score,
            answers,
        })

        if (error) {
            console.error(error)
            return NextResponse.json({ error: "Failed to save attempt" }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Save quiz attempt error:", error)
        return NextResponse.json({ error: "Failed to save" }, { status: 500 })
    }
}