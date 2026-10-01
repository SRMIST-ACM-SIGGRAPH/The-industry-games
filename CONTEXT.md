# Project Context for AI Agents & Developers

## Overview
This is **The Industry Games**, a Hunger Games-themed hackathon event portal.

> **CRITICAL DEADLINE: October 2nd End of Day (EOD)**  
> High velocity sprint. Work is strictly divided into **4 Developer Pods (2 Devs per Pod)** across 8 linked GitHub Issues (see `requirements.md`). All contributions must go through feature branches and Pull Requests.

---

## Technical Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS (`src/app/globals.css`). **STRICT RULE: DO NOT USE TAILWIND CSS**.
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Auth via OTP)
- **Animations & 3D**: `framer-motion`, `lenis` (smooth scrolling), `three`, `@react-three/fiber`, `@react-three/drei`.
- **Hosting & CI/CD**: Vercel with automatic Deploy Previews per PR.

---

## Developer Pods & Branching Rules

Direct pushes to `main` are disabled and blocked. Every pair must work on their assigned branch:

- **Pod 1 (Devs 1 & 2)**: `feat/issue-1-2-visuals-experience`
- **Pod 2 (Devs 3 & 4)**: `feat/issue-3-4-onboarding-dashboard`
- **Pod 3 (Devs 5 & 6)**: `feat/issue-5-6-alliances-submissions`
- **Pod 4 (Devs 7 & 8)**: `feat/issue-7-8-admin-announcements`

All commits must follow **Conventional Commits** (`feat:`, `fix:`, `style:`, `refactor:`, `docs:`, `chore:`).

---

## Testing & Deploy Preview Workflow (CRITICAL)

> **IMPORTANT:** Developers will **NOT** be able to test full authentication flows locally due to cloud OTP and domain-restricted auth configurations.
> 
> **How to test your work:**
> 1. Developers must create a branch and **open a Pull Request early** (as a Draft PR if work is in progress).
> 2. Vercel will automatically generate a dedicated **Deploy Preview URL** for the PR.
> 3. Use this live Vercel Preview URL to test and verify all end-to-end integration, OTP auth, and database interactions.

---

## Current Application State
- **Boilerplate**: Next.js App Router configured with vanilla CSS tokens.
- **Auth**: Email OTP authentication restricted to `@srmist.edu.in` implemented in `src/app/login/page.tsx`. Dynamic origin (`window.location.origin`) is used for preview redirect compatibility.
- **Global Layout**: `Navbar` (session-aware) and smooth scroll `LenisProvider` wrapped in `src/app/layout.tsx`.
- **Landing Page**: 3D Canvas placeholder, interactive sections, timeline, and problem statement placeholders in `src/app/page.tsx`.
- **Dashboard**: Protected route stub with alliance and submission cards in `src/app/dashboard/page.tsx`.
- **Admin**: The `/admin` routes must be strictly guarded, requiring authenticated login and verification against an authorized admin list.
- **Database**: Initial PostgreSQL schema and RLS rules in `supabase_schema.sql`.

---

## Architectural & Security Rules

1. **No Tailwind CSS**: All components must use pure Vanilla CSS classes and the design tokens defined in `src/app/globals.css` (e.g. `var(--accent-gold)`, `var(--accent-red)`, `var(--background)`, `var(--surface)`).
2. **Client vs Server Components**:
   - Default to React Server Components for static/data-fetching sections.
   - Use `"use client"` directive on files using hooks, `framer-motion`, `@react-three/fiber`, or interactive Supabase auth state.
3. **Database Security & RLS**:
   - Every Supabase table must have Row Level Security enabled.
   - Front-end clients must interact via `src/lib/supabase.ts` using the public `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
   - **NEVER** expose or commit any elevated secret or `service_role` key.
4. **Vercel Deploy Previews & Quality**:
   - Always run `npm run build` locally before pushing to verify zero build or type errors.
   - Test and validate all UI, animations, and flows on the live Vercel Deploy Preview.
