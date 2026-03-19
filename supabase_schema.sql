-- ==============================================================================
-- 🚀 NOPLIN CMS - OFFICIAL SUPABASE SCHEMA DEPLOYMENT
-- ==============================================================================

-- 1. Enable UUID Extension (Required for secure IDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. TABLE DEFINITIONS
-- ==============================================================================

-- A. Profiles Table (Cloned automatically from auth.users via Triggers)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'staff', 'client')),
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    job_title TEXT,
    company TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- B. Projects Table (Includes deliverables & rejection states natively!)
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'completed', 'approved')) DEFAULT 'pending',
    deadline TIMESTAMPTZ,
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    work_summary TEXT,
    work_links TEXT[],
    work_files TEXT[],  -- Arrays mapping to Supabase Storage bucket URLs
    client_feedback TEXT,
    price TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- C. Project Assignments (Many-to-Many Staff -> Project mapping)
CREATE TABLE public.project_assignments (
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    staff_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    PRIMARY KEY (project_id, staff_id)
);

-- D. Invoices Table (Financial Engine)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')) DEFAULT 'pending',
    issue_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- E. Notifications Table (WebSockets Hook target)
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('alert', 'success', 'message', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) ACTIVATION
-- ==============================================================================
-- Turns on absolute Zero-Trust policies globally. No one reads or writes without clearance.
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;


-- ==============================================================================
-- 4. RLS POLICIES (ACCESS RULES)
-- ==============================================================================

-- [PROFILES]
CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Users can read their own profile" ON public.profiles FOR SELECT USING (
    id = auth.uid()
);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (
    id = auth.uid()
);

-- [PROJECTS]
CREATE POLICY "Admins have full access to projects" ON public.projects FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Clients can view their own projects" ON public.projects FOR SELECT USING (
    client_id = auth.uid()
);
CREATE POLICY "Clients can update project status to approved/active" ON public.projects FOR UPDATE USING (
    client_id = auth.uid()
);
CREATE POLICY "Staff can view assigned projects" ON public.projects FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.project_assignments WHERE project_id = public.projects.id AND staff_id = auth.uid())
);
CREATE POLICY "Staff can update assigned projects (for deliverables)" ON public.projects FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.project_assignments WHERE project_id = public.projects.id AND staff_id = auth.uid())
);

-- [INVOICES]
CREATE POLICY "Admins have full access to invoices" ON public.invoices FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Clients can view their own invoices" ON public.invoices FOR SELECT USING (
    client_id = auth.uid()
);

-- [NOTIFICATIONS]
CREATE POLICY "Admins have full access to notifications" ON public.notifications FOR ALL USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
);
CREATE POLICY "Users can view and update their own notifications" ON public.notifications FOR ALL USING (
    user_id = auth.uid()
);


-- ==============================================================================
-- 5. AUTOMATED TRIGGERS & FUNCTIONS
-- ==============================================================================

-- Natively drops profiles immediately whenever an Invite Link goes out internally.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
DECLARE
    -- Look for role in the User metadata JSON sent by the API. If entirely missing, deploy 'staff'
    assigned_role TEXT := COALESCE(NEW.raw_user_meta_data->>'role', 'staff');
BEGIN
    INSERT INTO public.profiles (id, role, name, email, phone, job_title, company)
    VALUES (
        NEW.id,
        assigned_role,
        NEW.raw_user_meta_data->>'name',
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'job_title',
        NEW.raw_user_meta_data->>'company'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger seamlessly hooking auth.users -> profiles directly inside Postgres.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- END OF SCRIPT. DO NOT FORGET TO APPLY STORAGE BUCKET CONFIGURATION!
-- ==============================================================================
