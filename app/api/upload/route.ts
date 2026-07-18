import { NextRequest, NextResponse } from "next/server"
import PDFParser from "pdf2json"
import { supabase } from "../../lib/supabase";
import { getServerSession } from "next-auth";

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

        const formData = await req.formData()
        const file = formData.get("file") as File

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())

        const text = await new Promise<string>((resolve, reject) => {
            const pdfParser = new (PDFParser as any)(null, 1)
            pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError))
            pdfParser.on("pdfParser_dataReady", () => resolve(pdfParser.getRawTextContent()))
            pdfParser.parseBuffer(buffer)
        })

        const { data: insertedDoc, error: dbError } = await supabase
            .from("documents")
            .insert({
                title: file.name,
                raw_text: text,
                user_id: dbUser.id,
            })
            .select()
            .single()

        if (dbError) {
            console.error("Supabase insert error:", dbError)
            return NextResponse.json({ error: "Failed to save document" }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            documentId: insertedDoc.id,
            title: file.name,
            textPreview: text.slice(0, 500),
            fullTextLength: text.length,
        })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Failed to process PDF" }, { status: 500 })
    }
}