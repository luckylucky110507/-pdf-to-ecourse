import { supabase } from "@/app/lib/supabase";
import { getServerSession } from "next-auth";
import CourseView from "./CourseView";

export default async function CoursePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const session = await getServerSession();

    const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

    const { data: chapters, error: chaptersError } = await supabase
        .from("chapters")
        .select(`
            *,
            topics (
                *,
                lessons (*)
            )
        `)
        .eq("course_id", id);

    // Fetch user's progress for this course
    let progressMap: Record<string, boolean> = {};

    if (session?.user?.email) {
        const { data: dbUser } = await supabase
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .single();

        if (dbUser) {
            const { data: progressRows } = await supabase
                .from("progress")
                .select("lesson_id, completed")
                .eq("user_id", dbUser.id);

            if (progressRows) {
                progressRows.forEach((row) => {
                    progressMap[row.lesson_id] = row.completed;
                });
            }
        }
    }

    console.log("Course:", course);
    console.log("Course Error:", courseError);
    console.log("Chapters:", chapters);
    console.log("Chapters Error:", chaptersError);

    if (courseError) {
        return (
            <div className="p-10">
                <h1 className="text-3xl font-bold text-red-600">
                    Error Loading Course
                </h1>
                <pre>{JSON.stringify(courseError, null, 2)}</pre>
            </div>
        );
    }

    return (
        <CourseView
            course={course}
            chapters={chapters || []}
            initialProgress={progressMap}
            isLoggedIn={!!session?.user}
        />
    );
}