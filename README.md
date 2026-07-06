# NursePrep Study Lab

NursePrep is a React, Vite, TypeScript, and Convex nursing study platform. Learners can upload class materials, extract study topics with Gemini, generate NCLEX-style quiz banks, save progress, review missed questions, see weak-topic trends, and ask an AI tutor for deeper explanations.

## Stack

- React 19 + Vite + TypeScript
- Convex database, file storage, queries, mutations, and actions
- Gemini called only from Convex actions

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the public frontend configuration:

   ```bash
   cp .env.example .env.local
   ```

3. Link or initialize Convex:

   ```bash
   npx convex dev
   ```

   Select the existing deployment whose URL is `https://kindly-snake-231.convex.cloud`.

4. Set the rotated Gemini key in Convex. Never use a `VITE_` variable for this key:

   ```bash
   npx convex env set GEMINI_API_KEY "your-rotated-gemini-key"
   npx convex env set GEMINI_MODEL "gemini-2.5-flash"
   ```

5. Run the app:

   ```bash
   npm run dev
   ```

## Production

Deploy Convex functions first:

```bash
npx convex deploy
```

Then build the frontend:

```bash
npm run build
```

Set `VITE_CONVEX_URL` in the frontend host to the production Convex cloud URL.

## Security

- Gemini requests run in `convex/gemini.ts`.
- `GEMINI_API_KEY` belongs in Convex environment variables only.
- Uploaded files are stored in Convex storage and sent to Gemini from a server action.
- The current app uses a persistent anonymous browser identity. Replace `users.externalId` with Clerk, Auth0, or another verified auth subject before multi-user production use.

## Supported material formats

PDF, PPT/PPTX, DOC/DOCX, TXT, Markdown, PNG, JPEG, and WebP up to 20 MB. Gemini performs multimodal extraction from the original stored file.

## Data model

The schema includes separate tables for users, uploaded materials, extracted topics, quizzes, questions, attempts, answers, progress, missed questions, and AI explanation threads.
