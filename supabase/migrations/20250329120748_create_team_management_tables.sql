-- Create team_announcements table
CREATE TABLE IF NOT EXISTS public.team_announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
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

-- Create team_messages table
CREATE TABLE IF NOT EXISTS public.team_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create team_feedback table
CREATE TABLE IF NOT EXISTS public.team_feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create team_tasks table
CREATE TABLE IF NOT EXISTS public.team_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
    due_date TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.team_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Team announcements policies
CREATE POLICY "Team members can view announcements"
    ON public.team_announcements FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_announcements.team_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Team leads can create announcements"
    ON public.team_announcements FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_announcements.team_id
            AND user_id = auth.uid()
            AND role = 'lead'
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
        )
    );

-- Team messages policies
CREATE POLICY "Team members can view messages"
    ON public.team_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_messages.team_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can send messages"
    ON public.team_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_messages.team_id
            AND user_id = auth.uid()
        )
    );

-- Team feedback policies
CREATE POLICY "Team members can view feedback"
    ON public.team_feedback FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_feedback.team_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Team members can give feedback"
    ON public.team_feedback FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_feedback.team_id
            AND user_id = auth.uid()
        )
    );

-- Team tasks policies
CREATE POLICY "Team members can view tasks"
    ON public.team_tasks FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_tasks.team_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Team leads can create tasks"
    ON public.team_tasks FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_tasks.team_id
            AND user_id = auth.uid()
            AND role = 'lead'
        )
    );

CREATE POLICY "Team members can update their tasks"
    ON public.team_tasks FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_tasks.team_id
            AND user_id = auth.uid()
        )
    )
    WITH CHECK (
        assigned_to = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.team_members
            WHERE team_id = team_tasks.team_id
            AND user_id = auth.uid()
            AND role = 'lead'
        )
    );

-- Create triggers for updated_at
CREATE TRIGGER handle_team_announcements_updated_at
    BEFORE UPDATE ON public.team_announcements
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_team_documents_updated_at
    BEFORE UPDATE ON public.team_documents
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_team_messages_updated_at
    BEFORE UPDATE ON public.team_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_team_feedback_updated_at
    BEFORE UPDATE ON public.team_feedback
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_team_tasks_updated_at
    BEFORE UPDATE ON public.team_tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at(); 