-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create profiles table first since it's referenced by other tables
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'startup')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create teams table
CREATE TABLE IF NOT EXISTS public.teams (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    lead_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    skills TEXT[] DEFAULT '{}',
    portfolio_url TEXT,
    achievements JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('lead', 'member')),
    status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'rejected')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
    UNIQUE(team_id, user_id)
);

-- Create applications table
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    team_id UUID NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cover_letter TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES public.teams(id) ON DELETE CASCADE
);

-- Create team_documents table
CREATE TABLE IF NOT EXISTS public.team_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_documents ENABLE ROW LEVEL SECURITY;

-- Teams policies
CREATE POLICY "Users can view all teams"
    ON public.teams FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can create teams"
    ON public.teams FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = lead_id);

CREATE POLICY "Team leads can update their teams"
    ON public.teams FOR UPDATE
    TO authenticated
    USING (auth.uid() = lead_id)
    WITH CHECK (auth.uid() = lead_id);

CREATE POLICY "Team leads can delete their teams"
    ON public.teams FOR DELETE
    TO authenticated
    USING (auth.uid() = lead_id);

-- Team members policies
CREATE POLICY "Users can view team members"
    ON public.team_members FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team leads can add members"
    ON public.team_members FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE id = team_id AND lead_id = auth.uid()
        )
    );

CREATE POLICY "Team leads can remove members"
    ON public.team_members FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE id = team_id AND lead_id = auth.uid()
        )
    );

-- Applications policies
CREATE POLICY "Users can view applications"
    ON public.applications FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Team leads can create applications"
    ON public.applications FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.teams
            WHERE id = team_id AND lead_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can update application status"
    ON public.applications FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND created_by = auth.uid()
        )
    );

-- Team documents policies
CREATE POLICY "Team members can view documents"
    ON public.team_documents FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_documents.team_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

CREATE POLICY "Team members can upload documents"
    ON public.team_documents FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_documents.team_id
            AND user_id = auth.uid()
            AND status = 'active'
        )
    );

-- Create functions for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER handle_teams_updated_at
    BEFORE UPDATE ON public.teams
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_applications_updated_at
    BEFORE UPDATE ON public.applications
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
