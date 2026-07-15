# PDF to E-Course Learning Platform

Full Stack AI-powered platform that converts PDF documents into structured, interactive e-courses using LLMs. Built as part of the Full Stack AI Assignment for the GenAI Internship at In2Peta Services.

## Overview

Users can upload any PDF (books, research papers, study material, documentation) and the platform automatically converts it into a structured learning course with chapters, topics, and lessons — complete with an AI chatbot companion and auto-generated quizzes.

## Tech Stack

- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** Supabase (PostgreSQL)
- **Auth:** NextAuth.js (Google OAuth + Email/Password)
- **AI:** Groq / OpenRouter (LLM), pdf-parse (PDF text extraction)
- **Deployment:** Vercel

## Features

- 🔐 User authentication with personal dashboard
- 📄 PDF upload and text extraction
- 🤖 AI-powered course generation (chapters, topics, lessons)
- 📊 Learning progress tracking
- 💬 AI learning companion chatbot
- 📝 Auto-generated quizzes (MCQ, True/False)
- 🔍 Search across course content
- 📱 Responsive UI

## Getting Started

1. Clone the repository
   \`\`\`bash
   git clone https://github.com/luckylucky110507/-pdf-to-ecourse.git
   cd pdf-to-ecourse
   \`\`\`

2. Install dependencies
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables (create a `.env.local` file):
   \`\`\`
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   NEXTAUTH_SECRET=
   GOOGLE_CLIENT_ID=
   GOOGLE_CLIENT_SECRET=
   GROQ_API_KEY=
   \`\`\`

4. Run the development server
   \`\`\`bash
   npm run dev
   \`\`\`

5. Open [http://localhost:3000](http://localhost:3000)

## Author

Built by lucky as part of the In2Peta Services internship assessment.
