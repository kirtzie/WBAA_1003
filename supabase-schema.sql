-- ============================================================
-- Student Management System — Supabase schema
-- Run this once in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- Students ----------
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  roll_no text,
  gender text,
  class text,
  section text,
  dob date,
  admission_date date,
  parent_name text,
  parent_phone text,
  address text,
  created_at timestamptz not null default now()
);

-- ---------- Attendance ----------
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  date date not null,
  status text not null check (status in ('present', 'absent')),
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

-- ---------- Row Level Security ----------
-- This is an admin-only tool: any signed-in (authenticated) user
-- can read and write. Only accounts you create in Authentication
-- → Users will ever be able to sign in, so this is safe for a
-- single-school admin panel.

alter table students enable row level security;
alter table attendance enable row level security;

create policy "Authenticated users can manage students"
  on students for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage attendance"
  on attendance for all
  to authenticated
  using (true)
  with check (true);

-- ---------- Helpful indexes ----------
create index if not exists idx_students_class on students(class);
create index if not exists idx_attendance_date on attendance(date);
