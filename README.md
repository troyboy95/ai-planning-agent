# AI Planning Agent

An intelligent, multi-agent AI application built with Next.js that transforms raw problem statements into structured, highly-actionable execution plans. It utilizes Google's Gemini Models, Firebase Authentication, and Firestore for robust, secure plan generation and storage.

## Features

- **Multi-Agent Pipeline**: Breaks down complex queries through distinct analytical phases (Planner, Insight, Execution).
- **Secure Persistence**: Integrated with Firebase Auth (Google Sign-In) and Firestore DB. User reports are strictly isolated through backend token verification and rigorous Firestore Security Rules.
- **Micro-Editing**: Edit individual sections of your generated report with AI iteratively, rather than regenerating the entire document from scratch.
- **Server-Side Exports**: Generate highly accurate, production-ready `.pdf` and `.docx` exports dynamically on the backend using `pdfmake` and `docx`.
- **Modern UI**: Polished, responsive interface built with Tailwind CSS v4 and `lucide-react` icons.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **AI/LLMs**: Google Gemini API (`@google/genai`)
- **Database/Auth**: Firebase & Firebase Admin SDK
- **Exporting**: `pdfmake` & `docx`

