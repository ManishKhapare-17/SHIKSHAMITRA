# ShikshaMitra AI 🎓✨

**An AI-Powered Learning Companion for Primary-School Students**

ShikshaMitra AI is an educational MVP built to help primary-school students (specifically Grade 4) understand academic concepts, practice through quizzes, receive step-by-step patient explanations, and improve their learning performance.

---

## 🌟 Primary Features

### 1. Student Dashboard
- **Welcoming Student-Centric Interface**: Cheerful, balanced color palette with high accessibility and child-friendly typography.
- **Daily Learning Goal**: Visual tracker of daily lessons completed.
- **Learning Streak**: Tracks active consecutive days of learning.
- **Subject Cards**: Mathematics, Science & Environmental Studies (EVS), and English with live completion progress.
- **Dynamic Recommendations**: Transparent suggestions (e.g. recommend quiz retries if topic accuracy is below 70%, suggest uncompleted lessons).
- **Recent Activity & 7-Day Histogram**: Tracks lessons completed and quiz attempts.

### 2. Interactive Lesson Player
- **Structured Pedagogy**:
  1. Clear Learning Objectives
  2. Plain-language Explanations
  3. Relatable Real-Life Examples (e.g., pizza fractions, kitchen water cycle, classroom nouns)
  4. Visual Models (inline SVG/CSS diagrams: pizza slices, water cycle process, noun category cards)
  5. Step-by-Step Breakdown with practical examples
  6. Instant Knowledge Check with instant feedback
  7. Actions to ask AI Tutor, start practice quiz, and mark lesson complete
- **Progress Tracking**: Idempotent completion prevents duplicate records.

### 3. Quiz Engine
- **Three Difficulty Levels**: Easy (3 questions), Medium (3 questions), and Hard (3 questions) per lesson.
- **High-Quality Curriculum Bank**: 27 lesson-aligned questions with exactly 4 options and a single defensible correct answer.
- **Dual Explanations**: Provides custom explanations for both correct and incorrect choices.
- **Full Review Screen**: Lets students inspect every question, review what they picked, and read the explanation.
- **Zero Internet Requirement**: Bundled quizzes run entirely offline without requiring an AI key or external connection.

### 4. Real AI Tutor (Google Gemini 1.5)
- **Pedagogical Persona**: Acts as a patient, warm, encouraging teacher who guides the child through reasoning instead of just giving away answers.
- **Lesson Context Awareness**: Passes the current lesson and subject context to the tutor.
- **Secure Server-Side Route Handler** (`/api/tutor`): Server-only environment variable `GEMINI_API_KEY` prevents key leakage to client bundles.
- **Safe Fallback & Offline Mode**: When offline or if the API key is not configured, built-in curriculum hints are automatically displayed. Built-in hints are transparently labeled as offline hints rather than faked AI responses.
- **Child Safety**: Request body validation, message length limits (1,000 characters), conversation history truncation, no dangerous HTML injection, and safe plain-text rendering.

### 5. Learning Progress Dashboard
- **Comprehensive Activity Metrics**: Tracks lessons started, lessons completed, quiz attempts, and overall quiz accuracy.
- **Topic-Level Performance**: Displays best and latest scores for each lesson with a "Needs Practice" indicator if score < 70%.
- **Safe Versioned Persistence**: Browser `localStorage` schema with versioning (`v2`), validation against malformed JSON, and graceful degradation if storage is disabled.
- **Clear Privacy & Device Notice**: Informs students/parents that progress is stored locally on the browser/device and is not synced across devices.

### 6. Offline Functionality & PWA Support
- **Service Worker (`/sw.js`)**: Caches the app shell, bundled lessons, quizzes, and UI assets.
- **Web App Manifest (`/manifest.json`)**: Configured for standalone mobile and desktop installation.
- **Online/Offline Indicator**: Automatic indicator notifying students when connection drops, assuring them that lessons and quizzes still work.
- **Safe Cache Policy**: Live AI tutor requests (`/api/tutor`) are never stored in service worker caches.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Runtime & Language**: React 19, TypeScript (Strict Type Checking)
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **Testing**: Jest, ts-jest, React Testing Library
- **Storage**: Browser `localStorage` with versioned schema

---

## 📂 Project Architecture

```
d:\SHIKSHAMITRA
├── app/
│   ├── api/
│   │   └── tutor/
│   │       └── route.ts          # Server-side Gemini AI route handler
│   ├── lessons/
│   │   └── [lessonId]/
│   │       └── page.tsx          # Lesson detail route
│   ├── progress/
│   │   └── page.tsx              # Student progress dashboard
│   ├── quiz/
│   │   └── [lessonId]/
│   │       └── page.tsx          # Quiz runner route
│   ├── settings/
│   │   └── page.tsx              # Student profile & reset settings
│   ├── subjects/
│   │   ├── [subjectId]/
│   │   │   └── page.tsx          # Subject detail with lesson list
│   │   └── page.tsx              # Subjects catalog
│   ├── globals.css               # Design tokens, accessibility focus styles
│   ├── layout.tsx                # App root layout with PWA metadata
│   └── page.tsx                  # Student home dashboard
├── components/
│   ├── LessonPlayer.tsx          # Interactive 4-phase lesson engine
│   ├── LessonVisuals.tsx         # Inline SVG & CSS visual learning models
│   ├── Logo.tsx                  # ShikshaMitra AI logo mark
│   ├── NavBar.tsx                # Desktop top bar & mobile navigation
│   ├── OnlineIndicator.tsx       # Live online/offline status banner
│   ├── QuizInterface.tsx         # Interactive quiz session with review
│   ├── ServiceWorkerRegistration.tsx # Registers sw.js safely
│   └── ui.tsx                    # Accessible UI primitives (Button, Card, Badge, ProgressBar)
├── lib/
│   ├── lessons.ts                # Bundled lessons (Maths, Science, English)
│   ├── progress.ts               # LocalStorage engine, streak, recommendations
│   ├── quiz-engine.ts            # Scoring, session generation, evaluation
│   ├── quizzes.ts                # Question banks across all difficulties
│   ├── subjects.ts               # Subject metadata and definitions
│   └── types.ts                  # Shared TypeScript interfaces & types
├── public/
│   ├── manifest.json             # Web App Manifest
│   └── sw.js                     # Offline Service Worker cache
├── __tests__/
│   ├── progress.test.ts          # Unit tests for progress persistence & streak
│   ├── quiz-engine.test.ts       # Unit tests for scoring, answers & session
│   └── tutor-api.test.ts         # Unit tests for API validation & fallback
├── .env.example                  # Environment template
├── jest.config.js                # Jest test runner configuration
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript strict configuration
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v18.17.0` or higher (tested with `v24.19.0`)
- npm `v9.0.0` or higher (tested with `v11.17.0`)

### Installation
1. Clone or navigate to the repository directory:
   ```bash
   cd d:\SHIKSHAMITRA
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (optional for AI tutoring):
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *(Note: If you do not provide an API key, all lessons, quizzes, progress tracking, and built-in tutor hints still function normally!)*

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🧪 Testing and Verification

Run the full test suite (51 unit tests):
```bash
npm test
```

Run TypeScript type checking:
```bash
npx tsc --noEmit
```

Run ESLint code verification:
```bash
npm run lint
```

Run the production build:
```bash
npm run build
```

---

## 🔒 Safety, Privacy & Security

- **No Personal Information Collected**: No full names, addresses, phone numbers, or passwords are requested or stored.
- **Server-Side API Protection**: `GEMINI_API_KEY` is only accessed inside `/api/tutor/route.ts` and never passed into browser bundles (`NEXT_PUBLIC_` variables are deliberately avoided).
- **Untrusted Output Sanitization**: AI responses are rendered using plain-text and parsed safe text blocks. No raw HTML (`dangerouslySetInnerHTML`) or scripts are executed.
- **Input Validation**: Tutor queries are strictly limited to 1,000 characters and 20 history items. Non-conforming payloads return `400 Bad Request`.
- **Honest AI Communication**: Responses are clearly presented as educational guidance, and children are advised to verify key answers with their teachers.

---

## 📦 Deployment to Vercel

1. Commit and push the repository to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete ShikshaMitra AI educational MVP"
   git remote add origin https://github.com/<your-username>/shikshamitra-ai.git
   git branch -M main
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com/) and click **"Add New Project"**.
3. Import the `shikshamitra-ai` repository.
4. Set the Framework Preset to **Next.js**.
5. In **Environment Variables**, add:
   - Key: `GEMINI_API_KEY`
   - Value: `your_gemini_api_key`
6. Click **Deploy**. Vercel will build and launch your production application.

---

## ⚠️ Known Limitations & Future Roadmap

- **Browser-Local Storage**: Student progress is stored in `localStorage` on the current device. Cross-device progress sync would require an opt-in cloud database.
- **Curriculum Scope**: Current MVP features Grade 4 Mathematics (Fractions), Science/EVS (The Water Cycle), and English (Nouns). Future versions can expand across Grades 1–5 with full NCERT/CBSE alignment.
- **AI Latency & Quotas**: Real-time AI tutoring relies on Google Gemini API connectivity. Built-in hints ensure children can always learn even without internet.
