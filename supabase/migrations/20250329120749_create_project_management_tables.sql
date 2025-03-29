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
    status TEXT NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed', 'blocked')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create project_feedback table
CREATE TABLE IF NOT EXISTS public.project_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES public.project_milestones(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_feedback ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Project milestones policies
CREATE POLICY "Project members can view milestones"
    ON public.project_milestones FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_milestones.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_milestones.project_id
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Project owner can create milestones"
    ON public.project_milestones FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_milestones.project_id
            AND created_by = auth.uid()
        )
    );

-- Project tasks policies
CREATE POLICY "Project members can view tasks"
    ON public.project_tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_tasks.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_tasks.project_id
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Project owner can create tasks"
    ON public.project_tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_tasks.project_id
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Project members can update their tasks"
    ON public.project_tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_tasks.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_tasks.project_id
            AND created_by = auth.uid()
        )
    )
    WITH CHECK (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_tasks.project_id
            AND created_by = auth.uid()
        )
    );

-- Project documents policies
CREATE POLICY "Project members can view documents"
    ON public.project_documents FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_documents.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_documents.project_id
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Project members can upload documents"
    ON public.project_documents FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_documents.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_documents.project_id
            AND created_by = auth.uid()
        )
    );

-- Project messages policies
CREATE POLICY "Project members can view messages"
    ON public.project_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_messages.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_messages.project_id
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Project members can send messages"
    ON public.project_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_messages.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_messages.project_id
            AND created_by = auth.uid()
        )
    );

-- Project feedback policies
CREATE POLICY "Project members can view feedback"
    ON public.project_feedback FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_feedback.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_feedback.project_id
            AND created_by = auth.uid()
        )
    );

CREATE POLICY "Project members can give feedback"
    ON public.project_feedback FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE project_id = project_feedback.project_id
            AND status = 'accepted'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.projects
            WHERE id = project_feedback.project_id
            AND created_by = auth.uid()
        )
    );

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

CREATE TRIGGER handle_project_messages_updated_at
    BEFORE UPDATE ON public.project_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_project_feedback_updated_at
    BEFORE UPDATE ON public.project_feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 