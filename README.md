# StudySpark - AI-Powered Personalized Study Builder for Kids

StudySpark is an AI-powered platform that enables parents to create personalized, age-appropriate study materials for their children in minutes.

## Tech Stack

- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS v3 + @tailwindcss/typography
- **UI:** Radix UI primitives, Shadcn-style components
- **Charts:** Recharts
- **Forms:** React Hook Form + Zod
- **Backend:** Supabase (Auth, Database, Storage, Edge Functions)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase URL and anon key
   ```

3. **Build**
   ```bash
   npm run build
   ```

4. **Preview production build**
   ```bash
   npm run preview
   ```

## Project Structure

- `src/pages/` - Page components (Landing, Dashboard, Auth, etc.)
- `src/components/` - Reusable UI components and layout
- `src/lib/` - Utilities, Supabase client, API helpers
- `src/routes.tsx` - React Router configuration

## Pages

- **Landing** – Hero, features, how-it-works, pricing, FAQ
- **Auth** – Login, Signup, Email verification, Password reset
- **Dashboard** – Overview, Study Library, Create Study wizard
- **Study Detail** – Review, edit, export, share
- **Study Viewer** – Child-facing interactive player
- **Settings** – Profile, children, notifications, billing, privacy
- **Legal** – Privacy Policy, Terms, Cookie Policy
- **Help** – Help center, FAQ, contact
