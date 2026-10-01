## Description
<!-- Describe your changes in detail and link the related GitHub issue -->
Fixes / Closes #(issue_number)

## Type of Change
- [ ] `feat`: A new feature
- [ ] `fix`: A bug fix
- [ ] `style`: CSS / visual polish (no logic change)
- [ ] `refactor`: Code refactoring without behavior changes
- [ ] `docs`: Documentation updates
- [ ] `chore`: Build/config updates

## Affected Area
- [ ] Landing Page (3D / Animations / Problem Statements)
- [ ] Auth & Onboarding Flow
- [ ] Dashboard & Team Alliance
- [ ] Submissions & File Uploads (Supabase Storage)
- [ ] Admin Portal & Verification
- [ ] Database Schema / RLS Policies

## Screenshots / Screen Recordings (Mandatory for UI Changes)
<!-- Attach screenshots or quick screen recordings showing your changes -->

## Pre-Merge Checklist
- [ ] I have linked the relevant GitHub Issue above.
- [ ] My branch follows the naming convention (`feat/issue-#-description` or `fix/...`).
- [ ] All commit messages adhere to **Conventional Commits** (`feat:`, `fix:`, `chore:`, etc.).
- [ ] **NO Tailwind CSS** is used; all styling adheres strictly to `src/app/globals.css` CSS variables.
- [ ] No secrets, `.env`, or `.env.local` files are included in this PR.
- [ ] The app builds cleanly locally with `npm run build` without TypeScript or lint errors.
- [ ] Verified responsiveness on both mobile and desktop viewports.
- [ ] If introducing Supabase queries, Row Level Security (RLS) policies have been respected.
