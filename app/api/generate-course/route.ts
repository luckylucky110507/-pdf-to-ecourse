import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { supabase } from "../../lib/supabase";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(req: NextRequest) {
    try {
        const { documentId } = await req.json();

        // Get document
        const { data: document, error: docError } = await supabase
            .from("documents")
            .select("*")
            .eq("id", documentId)
            .single();

        if (docError || !document) {
            return NextResponse.json(
                { error: "Document not found" },
                { status: 404 }
            );
        }

        const prompt =
            "Return ONLY valid JSON.\n\n" +
            "{\n" +
            '  "courseTitle": "",\n' +
            '  "description": "",\n' +
            '  "chapters": [\n' +
            "    {\n" +
            '      "title": "",\n' +
            '      "topics": [\n' +
            "        {\n" +
            '          "title": "",\n' +
            '          "summary": "",\n' +
            '          "lessons": [\n' +
            "            {\n" +
            '              "title": "",\n' +
            '              "content": "",\n' +
            '              "key_takeaways": []\n' +
            "            }\n" +
            "          ]\n" +
            "        }\n" +
            "      ]\n" +
            "    }\n" +
            "  ]\n" +
            "}\n\n" +
            "Instructions:\n" +
            "- Generate 3-5 chapters.\n" +
            "- Each chapter should have 2-4 topics.\n" +
            "- Each topic should have 2 lessons.\n" +
            "- Every lesson should include detailed content and key takeaways.\n\n" +
            "PDF Content:\n" +
            document.raw_text;

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
            temperature: 0.3,
        });

        const aiResponse = completion.choices[0]?.message?.content;

        if (!aiResponse) {
            return NextResponse.json(
                { error: "No AI response" },
                { status: 500 }
            );
        }

        const cleaned = aiResponse
            .replace(/^```json/i, "")
            .replace(/^```/, "")
            .replace(/```$/, "")
            .trim();

        const course = JSON.parse(cleaned);

        // DEBUG: Full AI-generated structure check
        console.log("=== FULL COURSE JSON FROM AI ===");
        console.log(JSON.stringify(course, null, 2));

        // Save course
        const { data: savedCourse, error: courseError } = await supabase
            .from("courses")
            .insert({
                title: course.courseTitle,
                description: course.description,
                document_id: documentId,
                user_id: document.user_id,
            })
            .select()
            .single();

        if (courseError) throw courseError;

        // Save chapters
        for (const chapter of course.chapters || []) {

            const { data: savedChapter, error: chapterError } = await supabase
                .from("chapters")
                .insert({
                    course_id: savedCourse.id,
                    title: chapter.title,
                })
                .select()
                .single();

            if (chapterError) {
                console.error("Chapter Error:", chapterError);
                continue;
            }

            // Save topics
            for (const topic of chapter.topics || []) {

                const { data: savedTopic, error: topicError } = await supabase
                    .from("topics")
                    .insert({
                        chapter_id: savedChapter.id,
                        title: topic.title,
                        summary: topic.summary ?? "",
                    })
                    .select()
                    .single();

                if (topicError) {
                    console.error("Topic Error:", topicError);
                    continue;
                }

                // DEBUG: check what lessons array looks like for this topic
                console.log("Topic:", topic.title, "has lessons:", topic.lessons);
                console.log("Saved topic id:", savedTopic?.id);

                // Save lessons
                for (const lesson of topic.lessons || []) {

                    console.log("Inserting lesson:", lesson.title, "for topic_id:", savedTopic.id);

                    const { data: savedLesson, error: lessonError } = await supabase
                        .from("lessons")
                        .insert({
                            topic_id: savedTopic.id,
                            title: lesson.title,
                            content: lesson.content,
                            key_takeaways: lesson.key_takeaways ?? [],
                        })
                        .select()
                        .single();

                    if (lessonError) {
                        console.error("Lesson Error:", lessonError);
                    } else {
                        console.log("Lesson saved successfully:", savedLesson?.id);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            courseId: savedCourse.id,
        });

    } catch (error) {
        console.error("TOP LEVEL ERROR:", error);

        return NextResponse.json(
            {
                error: "Internal Server Error",
            },
            { status: 500 }
        );
    }
}