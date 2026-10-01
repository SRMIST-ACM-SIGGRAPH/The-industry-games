# The Industry Games - Hackathon Portal

Welcome to the central repository for **The Industry Games** hackathon website. This portal serves as the registration, team alliance, and submission hub for tributes.

> **CRITICAL DEADLINE: October 2nd End of Day (EOD)**  
> Work is distributed into **4 Developer Pods (2 Devs per Pod)** across 8 linked GitHub Issues.  
> **Strict Rule:** Direct pushes to `main` are disabled. All features must be developed on issue branches and tested via Vercel Deploy Previews before merging.

---

## Getting Started

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_public_key
```

> **Security Note:** NEVER commit `.env.local` to git. Only the public `anon` key is used on the frontend. The `service_role` key must **never** be shared or placed in client code.

### 3. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Git & Collaboration Workflow

### 1. Branch-Per-Issue Rule (No Direct Pushes to `main`)
Direct pushes to `main` are disabled. Every developer pod must work on an isolated branch tied to their assigned issues:
```bash
git checkout main
git pull origin main
git checkout -b <type>/issue-<numbers>-<short-description>
```

**Pod Branches:**
- **Pod 1 (Devs 1 & 2)**: `feat/issue-1-2-visuals-experience`
- **Pod 2 (Devs 3 & 4)**: `feat/issue-3-4-onboarding-dashboard`
- **Pod 3 (Devs 5 & 6)**: `feat/issue-5-6-alliances-submissions`
- **Pod 4 (Devs 7 & 8)**: `feat/issue-7-8-admin-announcements`

### 2. Conventional Commits
All commit messages must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
```
<type>(<scope>): <description>
```
**Allowed Types:** `feat`, `fix`, `style`, `refactor`, `docs`, `chore`.  
*Example:* `feat(teams): implement team code generation and 4-member limit check`

### 3. Pull Requests & Vercel Deploy Previews
- When a pod pushes their branch and opens a Pull Request targeting `main`, Vercel automatically creates an isolated **Deploy Preview** URL.
- Because local authentication testing is limited, **open your PR early** (or as a draft PR) to test your feature against the live Vercel Preview deployment.
- Fill out the PR template completely (`.github/pull_request_template.md`).
- Ensure `npm run build` succeeds locally with zero errors before opening or requesting review on a PR.

---

## Security & Architecture Guidelines
1. **No Tailwind CSS**: All styling must use standard Vanilla CSS and custom tokens in `src/app/globals.css`.
2. **Supabase Row Level Security (RLS)**: RLS must remain enabled on all tables.
3. **Never Share Secrets**: Never expose `service_role` keys or commit `.env` files.
4. **AI Assistance**: If you are using an AI agent or coding assistant, point it to `CONTEXT.md` before writing code.
