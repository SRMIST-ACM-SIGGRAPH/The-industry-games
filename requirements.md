# The Industry Games - Hackathon Website Requirements

This document outlines the requirements and feature list for the Hunger Games themed hackathon event website. It can be used to assign tasks to team members.

## 1. UI & Aesthetics (Hunger Games Theme)
- Implement a stunning, immersive Hunger Games aesthetic (dark, gritty, vibrant accents).
- Use **3D animations** (via Three.js / @react-three/fiber in Next.js).
- Implement **scroll-based animations** (via Lenis & Framer Motion).
- The pre-login landing page should display the **timeline** and **6 Problem Statements**.

## 2. Authentication
- Login/Signup is strictly restricted to `@srmist.edu.in` email addresses.
- **Magic Link / OTP via Email**: Authentication is handled via an email OTP code (`supabase.auth.signInWithOtp`).

## 3. Post-Login Flow & Registration
- **First Login Profile Completion**: On their very first login, a user must fill in their basic profile details before they can access the dashboard.
- Users can either:
  - **Create a team** (generates a unique team code).
  - **Join a team** (via a provided unique team code).
- **Team Rules**:
  - Maximum size is 4 members per team.
  - A user can only be part of 1 team at a time.
  - Team members can switch teams until their current team has madea an submission or deadline.
- **Countdown Timer**: A prominent, huge countdown timer until the registration/submission deadline.

## 4. Submissions & Verification
- Teams must upload a **PPT of their proposed solution** before the registration deadline for their registration to count.
- **Payment System**:
  - Payment is NOT required for the first 50 teams OR before a specific set date (whichever comes first).
  - Teams required to pay must upload a **screenshot of their payment proof**.
- **Admin Verification**:
  - Admins will manually verify payment screenshots via an Admin Dashboard.
  - Status toggle: `Verified` / `Not Verified` / `Rejected`.
  - If `Rejected`, the team receives an option to upload a new payment screenshot.

## 5. Announcements
- An **Announcements tab** visible to all participants.
- Admins can create and push new announcements from the Admin Dashboard.

## 6. Technical Stack & Infrastructure
- **Frontend**: Next.js (App Router) / Vanilla CSS for styling.
- **Backend / DB**: No separate backend required. Everything is handled via Supabase (PostgreSQL, Storage, Auth).
- **Storage**: Supabase Storage Buckets will be used for PPTs and Payment Screenshots.

## 7. Next Steps for Team Members
- [ ] Create the database tables in Supabase (Users, Teams, Submissions, Announcements) as per `database_schema.sql`.
- [ ] Set up the Supabase storage buckets (`submissions` and `payment_proofs`).
- [ ] Implement 3D/Scroll UI on the landing page.
- [ ] Implement Auth flow using Supabase OTP.
- [ ] Build User Dashboard (Team creation/joining, File uploads).
- [ ] Build Admin Dashboard (Verify payments, post announcements).
