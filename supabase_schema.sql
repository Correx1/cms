-- ==============================================================================
-- NOPLIN CMS — FULL RESET + FRESH SCHEMA
-- Run this entire script in: Supabase Dashboard → SQL Editor → New Query
-- ==============================================================================


-- ==============================================================================
-- STEP 0 — WIPE EVERYTHING (auth users cascade-delete all profile rows)
-- ==============================================================================

-- Drop all tables in dependency order
DROP TABLE IF EXISTS public.notifications    CASCADE;
DROP TABLE IF EXISTS public.project_files    CASCADE;
DROP TABLE IF EXISTS public.project_staff    CASCADE;
DROP TABLE IF EXISTS public.projects         CASCADE;
DROP TABLE IF EXISTS public.profiles         CASCADE;

-- Drop helper functions + triggers
DROP FUNCTION IF EXISTS public.get_my_role()        CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user()    CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at()     CASCADE;


-- ==============================================================================
-- STEP 1 — SAFE ROLE HELPER (avoids recursive RLS infinite-loop / 500 errors)
-- ==============================================================================
-- Every admin RLS policy must use THIS function instead of a direct subquery
-- on profiles — a direct subquery causes infinite recursion → 500 errors.

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER                 -- runs as owner, bypasses RLS on profiles
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;


-- ==============================================================================
-- STEP 2 — UPDATED_AT TRIGGER FUNCTION
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


-- ==============================================================================
-- STEP 3 — TABLES
-- ==============================================================================

-- A. profiles — mirrors auth.users (one row per auth account)
CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT        NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'staff'
                          CHECK (role IN ('admin', 'staff', 'client')),
  phone       TEXT,
  company     TEXT,
  job_title   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- B. projects
CREATE TABLE public.projects (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  details      TEXT,
  deliverables TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'active', 'completed', 'approved')),
  deadline     TIMESTAMPTZ,
  client_id    UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  price        TEXT,
  work_summary TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- C. project_staff — many-to-many: projects ↔ staff profiles
CREATE TABLE public.project_staff (
  project_id  UUID  REFERENCES public.projects(id) ON DELETE CASCADE,
  staff_id    UUID  REFERENCES public.profiles(id)  ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (project_id, staff_id)
);


-- D. project_files — files attached to projects (stored in Supabase Storage)
CREATE TABLE public.project_files (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID        NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name    TEXT        NOT NULL,
  file_path    TEXT        NOT NULL,   -- storage object path
  file_type    TEXT,
  file_size    BIGINT,
  uploaded_by  UUID        REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at  TIMESTAMPTZ DEFAULT NOW()
);


-- E. notifications
CREATE TABLE public.notifications (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT        NOT NULL CHECK (type IN ('alert', 'success', 'message', 'system')),
  title      TEXT        NOT NULL,
  message    TEXT        NOT NULL,
  is_read    BOOLEAN     DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- ==============================================================================
-- STEP 4 — ROW LEVEL SECURITY (enable on every table)
-- ==============================================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_staff   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications   ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- STEP 5 — RLS POLICIES
-- NOTE: All admin checks use public.get_my_role() to avoid recursion.
-- ==============================================================================

-- ── PROFILES ──────────────────────────────────────────────────────────────────

-- Admins see everything
CREATE POLICY "profiles: admin full access"
  ON public.profiles FOR ALL
  USING (public.get_my_role() = 'admin');

-- Every user can read their own row
CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Every user can update their own row
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ── PROJECTS ──────────────────────────────────────────────────────────────────

-- Admins: full access
CREATE POLICY "projects: admin full access"
  ON public.projects FOR ALL
  USING (public.get_my_role() = 'admin');

-- Staff: see projects they are assigned to
CREATE POLICY "projects: staff view assigned"
  ON public.projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.project_staff ps
      WHERE ps.project_id = projects.id AND ps.staff_id = auth.uid()
    )
  );

-- Staff: update projects they are assigned to (status, deliverables)
CREATE POLICY "projects: staff update assigned"
  ON public.projects FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.project_staff ps
      WHERE ps.project_id = projects.id AND ps.staff_id = auth.uid()
    )
  );

-- Clients: see their own projects
CREATE POLICY "projects: client view own"
  ON public.projects FOR SELECT
  USING (client_id = auth.uid());


-- ── PROJECT_STAFF ─────────────────────────────────────────────────────────────

CREATE POLICY "project_staff: admin full access"
  ON public.project_staff FOR ALL
  USING (public.get_my_role() = 'admin');

-- Staff: see their own assignments
CREATE POLICY "project_staff: staff view own"
  ON public.project_staff FOR SELECT
  USING (staff_id = auth.uid());


-- ── PROJECT_FILES ─────────────────────────────────────────────────────────────

CREATE POLICY "project_files: admin full access"
  ON public.project_files FOR ALL
  USING (public.get_my_role() = 'admin');

-- Staff: view/upload files on assigned projects
CREATE POLICY "project_files: staff on assigned projects"
  ON public.project_files FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.project_staff ps
      WHERE ps.project_id = project_files.project_id AND ps.staff_id = auth.uid()
    )
  );

-- Clients: view files on their own projects
CREATE POLICY "project_files: client view own"
  ON public.project_files FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_files.project_id AND p.client_id = auth.uid()
    )
  );


-- ── NOTIFICATIONS ─────────────────────────────────────────────────────────────

CREATE POLICY "notifications: admin full access"
  ON public.notifications FOR ALL
  USING (public.get_my_role() = 'admin');

CREATE POLICY "notifications: user own"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid());


-- ==============================================================================
-- STEP 6 — AUTO-CREATE PROFILE ON NEW AUTH USER (trigger)
-- Fires whenever a user is created via Supabase Auth (admin API, magic link, etc.)
-- SECURITY DEFINER means it runs as the DB owner → bypasses RLS for the INSERT.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, phone, company, job_title)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'staff'),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company',
    NEW.raw_user_meta_data->>'job_title'
  )
  ON CONFLICT (id) DO NOTHING;   -- safe to re-run, never overwrites existing rows
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ==============================================================================
-- STEP 7 — CREATE YOUR ADMIN USER
-- After running the above, go to:
--   Supabase Dashboard → Authentication → Users → "Add user" (email + password)
-- Then run THIS to promote them to admin:
-- ==============================================================================

-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';


-- ==============================================================================
-- STEP 8 — STORAGE BUCKET (run separately or via dashboard)
-- ==============================================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('project-files', 'project-files', false)
-- ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- END OF SCRIPT ✅
-- Tables: profiles, projects, project_staff, project_files, notifications
-- RLS: enabled on all tables, admin uses safe get_my_role() function
-- Trigger: auto-creates profile row on every new auth user
-- ==============================================================================
