-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.project_milestones CASCADE;
DROP TABLE IF EXISTS public.project_tasks CASCADE;
DROP TABLE IF EXISTS public.project_documents CASCADE;
DROP TABLE IF EXISTS public.project_messages CASCADE;
DROP TABLE IF EXISTS public.project_feedback CASCADE;
DROP TABLE IF EXISTS public.project_notifications CASCADE;

-- Create project_milestones table
CREATE TABLE IF NOT EXISTS public.project_milestones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed')),
    assigned_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS public.project_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_documents table
CREATE TABLE IF NOT EXISTS public.project_documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_messages table
CREATE TABLE IF NOT EXISTS public.project_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_feedback table
CREATE TABLE IF NOT EXISTS public.project_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_notifications table
CREATE TABLE IF NOT EXISTS public.project_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('deadline', 'milestone', 'task', 'message', 'feedback')),
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notifications ENABLE ROW LEVEL SECURITY;

-- Project milestones policies
CREATE POLICY "Project members can view milestones"
    ON public.project_milestones FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project owners can manage milestones"
    ON public.project_milestones FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND created_by = auth.uid()
        )
    );

-- Project tasks policies
CREATE POLICY "Project members can view tasks"
    ON public.project_tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project members can manage tasks"
    ON public.project_tasks FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Project documents policies
CREATE POLICY "Project members can view documents"
    ON public.project_documents FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project members can upload documents"
    ON public.project_documents FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Project messages policies
CREATE POLICY "Project members can view messages"
    ON public.project_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project members can send messages"
    ON public.project_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Project feedback policies
CREATE POLICY "Project members can view feedback"
    ON public.project_feedback FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project members can give feedback"
    ON public.project_feedback FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM public.applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM public.team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Project notifications policies
CREATE POLICY "Users can view their notifications"
    ON public.project_notifications FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER handle_project_milestones_updated_at
    BEFORE UPDATE ON public.project_milestones
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_project_tasks_updated_at
    BEFORE UPDATE ON public.project_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_project_documents_updated_at
    BEFORE UPDATE ON public.project_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_project_feedback_updated_at
    BEFORE UPDATE ON public.project_feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 