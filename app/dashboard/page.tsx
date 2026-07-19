import { supabase } from "@/app/lib/supabase";
import { getServerSession } from "next-auth";
import Link from "next/link";
import SearchBar from "./SearchBar";
import ThemeToggle from "../ThemeToggle";

export default async function DashboardPage() {
    const session = await getServerSession();

    if (!session?.user?.email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4 text-[var(--ink)]">Please log in to view your dashboard</h1>
                    <Link href="/">
                        <button className="bg-[var(--primary)] text-white px-6 py-3 rounded-xl hover:bg-[var(--primary-hover)] transition-colors">
                            Go to Login
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const { data: dbUser } = await supabase
        .from("users")
        .select("id")
        .eq("email", session.user.email)
        .single();

    if (!dbUser) {
        return (
            <div className="p-10 bg-[var(--bg)] min-h-screen text-[var(--ink)]">
                <p>User not found in database.</p>
            </div>
        );
    }

    // Fetch all courses for this user, along with chapters/topics/lessons for completion calc
    const { data: courses, error: coursesError } = await supabase
        .from("courses")
        .select(`
            *,
            chapters (
                *,
                topics (
                    *,
                    lessons (*)
                )
            )
        `)
        .eq("user_id", dbUser.id)
        .order("created_at", { ascending: false });

    // Fetch all progress rows for this user
    const { data: progressRows } = await supabase
        .from("progress")
        .select("lesson_id, completed")
        .eq("user_id", dbUser.id);

    const completedLessonIds = new Set(
        (progressRows || []).filter((p) => p.completed).map((p) => p.lesson_id)
    );

    // Calculate completion % for each course
    const coursesWithProgress = (courses || []).map((course: any) => {
        const allLessons = (course.chapters || []).flatMap((ch: any) =>
            (ch.topics || []).flatMap((t: any) => t.lessons || [])
        );
        const completedCount = allLessons.filter((l: any) =>
            completedLessonIds.has(l.id)
        ).length;
        const percent =
            allLessons.length > 0
                ? Math.round((completedCount / allLessons.length) * 100)
                : 0;

        return {
            id: course.id,
            title: course.title,
            description: course.description,
            createdAt: course.created_at,
            totalLessons: allLessons.length,
            completedLessons: completedCount,
            percent,
        };
    });

    return (
        <div className="min-h-screen bg-[var(--bg)]">
            <div className="max-w-5xl mx-auto p-8">

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <p className="text-xs uppercase tracking-wider text-[var(--ink-muted)] mb-1">Welcome back</p>
                        <h1 className="text-4xl font-bold text-[var(--ink)]">My Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <Link href="/upload">
                            <button className="bg-[var(--primary)] text-white font-medium px-5 py-2.5 rounded-xl hover:bg-[var(--primary-hover)] transition-colors">
                                + Upload New PDF
                            </button>
                        </Link>
                    </div>
                </div>

                <SearchBar />

                {coursesError && (
                    <p className="text-red-500 mb-4">Error loading courses: {coursesError.message}</p>
                )}

                {coursesWithProgress.length === 0 ? (
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-10 text-center">
                        <p className="text-[var(--ink-muted)] text-lg mb-4">
                            You haven't created any courses yet.
                        </p>
                        <Link href="/upload">
                            <button className="bg-[var(--primary)] text-white font-medium px-6 py-3 rounded-xl hover:bg-[var(--primary-hover)] transition-colors">
                                Upload your first PDF
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {coursesWithProgress.map((course) => (
                            <Link key={course.id} href={`/course/${course.id}`}>
                                <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer h-full">
                                    <h2 className="text-xl font-bold mb-2 text-[var(--ink)]">{course.title}</h2>
                                    <p className="text-[var(--ink-muted)] text-sm mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="mb-2">
                                        <div className="flex justify-between text-xs font-semibold mb-1 text-[var(--ink)]">
                                            <span>Progress</span>
                                            <span>
                                                {course.percent}% ({course.completedLessons}/{course.totalLessons})
                                            </span>
                                        </div>
                                        <div className="w-full bg-[var(--surface-2)] rounded-full h-2">
                                            <div
                                                className="bg-[var(--primary)] h-2 rounded-full transition-all"
                                                style={{ width: `${course.percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-[var(--ink-muted)] mt-3">
                                        Created: {new Date(course.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}