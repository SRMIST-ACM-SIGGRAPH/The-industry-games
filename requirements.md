# The Industry Games - Hackathon Website Requirements

This document outlines the requirements and feature list for the Hunger Games themed hackathon event website.

> **CRITICAL DEADLINE: October 2nd, End of Day (EOD)**  
> Work is organized into **4 Developer Pods (2 Developers per Pod)** across 8 tasks. Each Pod works on isolated feature branches per issue. **Zero direct pushes to `main`**. All features must be previewed via Vercel Deploy Previews and merged via Pull Requests.

---

## 1. UI & Aesthetics (Hunger Games Theme)

- Immersive Hunger Games aesthetic (dark, gritty, bronze/gold and crimson accents).
- **3D animations**: Powered by Three.js via `@react-three/fiber` and `@react-three/drei`.
- **Scroll-based animations**: Smooth scrolling via Lenis paired with Framer Motion.
- Landing page must prominently showcase the **Timeline** and **6 Problem Statements**.
- **No Tailwind CSS**: All styling must use standard Vanilla CSS and the CSS tokens in `src/app/globals.css`.

---

## 2. Authentication Flow

- Restricted strictly to `@srmist.edu.in` email addresses.
- **Magic Link / OTP via Email**: Authentication is handled via email OTP verification (`supabase.auth.signInWithOtp` & `verifyOtp`).
- Dynamic origin redirects (`window.location.origin`) for compatibility with Vercel deploy previews.

---

## 3. Post-Login Flow & Registration

- **First Login Profile Completion**: Mandatory profile form (Full Name, Registration Number, Department/Branch, Contact) blocking dashboard access until filled.
- **Team / Alliance Management**:
  - **Create a team**: Generates a unique 6-character team code.
  - **Join a team**: Join via an existing team code.
  - **Team Rules**: Maximum 4 members per team. A user can only belong to 1 team at a time.
  - **Team Switching**: Members can leave or switch teams until their team makes a submission or the deadline passes.
- **Countdown Timer**: A prominent live countdown clock on the landing page and dashboard ticking down to the registration/submission deadline.

---

## 4. Submissions & Verification

- **Presentation Upload**: Teams must submit a PPT of their proposed solution before the deadline.
- **Payment Verification**:
  - Payment is waived for the first 50 registered teams OR before a designated early-bird date.
  - Remaining teams must upload a screenshot of their transaction proof.
  - **Admin Verification Panel**: Admins can review uploaded proofs and toggle status (`Verified` / `Not Verified` / `Rejected`).
  - If `Rejected`, team members see an alert with an option to re-upload.

---

## 5. Announcements Engine

- Public and in-dashboard announcements stream for realtime alerts and updates.
- Admin dashboard allows broadcasting new announcements with timestamps and urgency levels.

---

## 6. Admin Portal & Authorization

- **Strictly Guarded Access**: The `/admin` routes are protected by role-based authentication.
- Access requires a verified login AND explicit authorization against an approved admin list (`is_admin: true` in user profiles or Supabase admin metadata).
- Non-admin users attempting to navigate to `/admin` are immediately redirected with an Access Denied / 403 Forbidden state.

---

## 7. Technical Stack & Infrastructure

- **Frontend**: Next.js 15 (App Router) + Vanilla CSS (`globals.css`).
- **Backend / Database**: Supabase (PostgreSQL, Row Level Security, Auth via OTP).
- **Storage**: Supabase Storage Buckets (`submissions` and `payment_proofs`).
- **Deployment**: Vercel with automatic Deploy Previews on Pull Requests.

---

## 8. Developer Pod Assignments (8 Developers in 4 Pods)

Work is distributed across **4 Pods** (2 developers per group working collaboratively on paired issues):

### 🛡️ Pod 1: Visuals & Scroll Experience (Dev 1 & Dev 2)

- **Branch**: `feat/issue-1-2-visuals-experience`
- **Issue #1**: Implement interactive Three.js Hunger Games themed 3D canvas on the landing page (`@react-three/fiber` & `@react-three/drei`).
- **Issue #2**: Build Framer Motion scroll animations for the Event Timeline and 6 Problem Statement cards integrated with Lenis.

### 🏹 Pod 2: Tribute Onboarding & Dashboard UI (Dev 3 & Dev 4)

- **Branch**: `feat/issue-3-4-onboarding-dashboard`
- **Issue #3**: Build the First-Login Profile Onboarding modal/page and route guard gating `/dashboard` until registration details exist.
- **Issue #4**: Build the Live Countdown Timer and polish the main Tribute Dashboard layout, alliance stats card, and responsive mobile/desktop viewports.

### ⚔️ Pod 3: Alliance System & Storage Submissions (Dev 5 & Dev 6)

- **Branch**: `feat/issue-5-6-alliances-submissions`
- **Issue #5**: Implement Team creation (unique code generator), joining, max 4 members validation, and leave/switch team logic in Supabase.
- **Issue #6**: Connect Supabase Storage buckets for drag-and-drop PPT presentation upload and payment proof screenshot upload with validation.

### 🏛️ Pod 4: Admin Command Center & Broadcasts (Dev 7 & Dev 8)

- **Branch**: `feat/issue-7-8-admin-announcements`
- **Issue #7**: Build guarded `/admin` portal (requiring login + admin role verification), listing registered teams, payment proof viewer modal, and status toggles (`Verified` / `Rejected` / `Pending`).
- **Issue #8**: Build the Admin announcement broadcast tool and real-time announcement feed listener for tributes.

### 🍽️ Pod 5: Logistics & On-Ground Operations (Dev 9)

- **Branch**: `feat/issue-10-attendance-food-tracker`
- **Issue #10**: Build the Attendance and Food Tracker tab in the Admin panel.
  - Show attendance lists *only* for members of shortlisted teams, grouped by team.
  - Track attendance status (Present/Absent), timestamps, and the admin's UUID (`updated_by`).
  - Use a nested JSON object within the attendance table to track meals (e.g., `{ "Day1_Lunch": true }`).
  - Show food tracker options *only* to present participants.
  - Track meal distribution timestamps and the admin's UUID.
  - Gate the tab so it is only active starting Oct 9th (temporarily disabled for testing).
