# Student Management System — Rohtak Public School (Demo)

A simple admin panel for a school office: manage student records and mark daily attendance.
Plain HTML/CSS/JS — no build step — backed by Supabase.

**Pages**
- `index.html` — login
- `dashboard.html` — quick stats + recently added students
- `students.html` — add / edit / delete / search student records
- `attendance.html` — mark present/absent per class, per date

---

## 1. Set up Supabase (backend)

1. Go to [supabase.com](https://supabase.com) → create a free project.
2. Once it's ready, open **SQL Editor** → **New query**, paste the contents of
   `supabase-schema.sql` from this repo, and click **Run**. This creates the
   `students` and `attendance` tables with security rules already applied.
3. Create your admin login: go to **Authentication → Users → Add user**,
   enter an email and password. This is the account you'll use to log in —
   there's no public sign-up page, by design.
4. Get your API keys: go to **Settings → API**. Copy the:
   - **Project URL**
   - **anon public** key

## 2. Connect the frontend to Supabase

Open `js/supabaseClient.js` and replace the two placeholder values near the top:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

with the values you copied in step 1.4. Save the file.

## 3. Push to GitHub

```bash
cd student-management-system
git init
git add .
git commit -m "Student management system demo"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

## 4. Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick this repository.
3. Build settings: leave **Build command** blank and set
   **Build output directory** to `/` (this is a static site, nothing to build).
4. Click **Save and Deploy**. Cloudflare will give you a `*.pages.dev` URL —
   that's your live site. Log in with the admin account you created in step 1.3.

You can later attach your own domain under **Custom domains** in the same project.

---

## Notes for a real rollout

This demo intentionally keeps things simple for one school office:

- **Auth:** any account you create in Supabase can manage everything. If you
  later want teacher-only or read-only accounts, that needs role-based rules
  added to the RLS policies in `supabase-schema.sql`.
- **Anon key is public by design** — it's meant to be visible in frontend
  code. Supabase enforces access through the row-level security policies,
  not by hiding this key.
- **Photos, fees, exam records** aren't included here — the `students` table
  can be extended with more columns if you want to grow this later.
