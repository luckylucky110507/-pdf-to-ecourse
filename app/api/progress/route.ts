import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { supabase } from "@/app/lib/supabase";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Not logged in" }, { status: 401 });
        }

        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (!dbUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const { lessonId, completed } = await req.json();

        if (!lessonId) {
            return NextResponse.json({ error: "lessonId is required" }, { status: 400 });
        }

        // Check if progress row already exists
        const { data: existing } = await supabase
            .from("progress")
            .select("id")
            .eq("user_id", dbUser.id)
            .eq("lesson_id", lessonId)
            .single();

        if (existing) {
            // Update existing row
            const { error } = await supabase
                .from("progress")
                .update({
                    completed: completed,
                    completed_at: completed ? new Date().toISOString() : null,
                })
                .eq("id", existing.id);

            if (error) throw error;
        } else {
            // Insert new row
            const { error } = await supabase
                .from("progress")
                .insert({
                    user_id: dbUser.id,
                    lesson_id: lessonId,
                    completed: completed,
                    completed_at: completed ? new Date().toISOString() : null,
                });

            if (error) throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Progress Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}