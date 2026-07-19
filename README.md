# PDF to eCourse Platform

Turn any PDF document into a fully structured, interactive online course — complete with chapters, lessons, an AI tutor chatbot, auto-generated quizzes, and progress tracking.

## Live Demo
🔗 https://pdf-to-ecourse-platform-three.vercel.app

## What it does

1. **Sign in with Google** and upload any PDF
2. AI (Groq / Llama 3.3) reads the document and structures it into a full course: chapters → topics → lessons, complete with key takeaways
3. Track your progress lesson by lesson, resume anytime from your dashboard
4. Ask an **AI tutor chatbot** questions about the course — it has full context of the material
5. Take **AI-generated quizzes** (MCQ + True/False) at the end of each chapter, with instant scoring and explanations
6. **Search** across all your chapters, topics, and lessons
7. Get a one-click **AI summary** of any course
8. Toggle **dark mode**

## Tech Stack

- **Frontend:** Next.js 16 (App Router, TypeScript), Tailwind CSS
- **Auth:** NextAuth.js (Google OAuth)
- **Database:** Supabase (Postgres)
- **AI:** Groq API (Llama 3.3 70B) for course generation, chat, quizzes, and summaries
- **PDF Parsing:** pdf-parse
- **Deployment:** Vercel

## Core Features

| Feature | Description |
|---|---|
| Auth | Google sign-in via NextAuth.js, protected dashboard route |
| PDF Upload | Extracts text from any PDF and stores it in Supabase |
| Course Generation | AI structures raw text into chapters → topics → lessons with takeaways |
| Progress Tracking | Mark lessons complete, see % completion per course and per chapter |
| Dashboard | Lists all your courses with live progress bars |
| Search | Full-text search across chapters, topics, and lessons |
| AI Chatbot | Context-aware tutor that answers questions about the current course |
| Quiz Generator | Auto-generates 5 questions per chapter, scores instantly, saves attempts |
| Course Summary | One-click AI-generated overview of any course |
| Dark Mode | Persisted theme toggle across the whole app |

## Database Schema (Supabase)

- `users` — synced from Google auth
- `documents` — raw uploaded PDF text
- `courses` → `chapters` → `topics` → `lessons` (nested structure)
- `progress` — per-user, per-lesson completion state
- `chat_history` — per-user, per-course chat messages
- `quiz_attempts` — per-user, per-chapter quiz scores

## Local Setup

1. Clone the repo
```bash
   git clone https://github.com/luckylucky110507/-pdf-to-ecourse.git
   cd pdf-to-ecourse
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env.local` file with:
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SECRET_KEY=
GROQ_API_KEY=
4. Run the dev server
```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## What I'd add with more time

- Vector search / RAG so the chatbot can cite exact lesson sections
- Flashcards generated per chapter for spaced-repetition review
- Audio narration (text-to-speech) for lessons
- Support for uploading multiple PDFs into one merged course

---

Built as part of a GenAI internship assessment — focused on shipping a complete, working product across auth, ingestion, AI generation, and interactive learning features within a short timeframe.
