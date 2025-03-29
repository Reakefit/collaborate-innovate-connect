-- Add project_id to tasks table
ALTER TABLE tasks ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS project_discussions CASCADE;

-- Add project_id to notifications table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        AND column_name = 'project_id'
    ) THEN
        ALTER TABLE notifications ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create messages table with proper relationships
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for messages
CREATE POLICY "Project members can view messages"
    ON messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project members can create messages"
    ON messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Create project_discussions table
CREATE TABLE project_discussions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies for project_discussions
ALTER TABLE project_discussions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Project members can view discussions"
    ON project_discussions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project members can create discussions"
    ON project_discussions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own tasks" ON tasks;
DROP POLICY IF EXISTS "Users can create tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can create notifications" ON notifications;

-- Create new RLS policies for tasks
CREATE POLICY "Project members can view tasks"
    ON tasks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project members can create tasks"
    ON tasks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

-- Create new RLS policies for notifications
CREATE POLICY "Users can view their project notifications"
    ON notifications FOR SELECT
    USING (
        user_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    );

CREATE POLICY "Project members can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE id = project_id AND (
                created_by = auth.uid() OR
                EXISTS (
                    SELECT 1 FROM applications
                    WHERE project_id = projects.id AND team_id IN (
                        SELECT team_id FROM team_members
                        WHERE user_id = auth.uid()
                    )
                )
            )
        )
    ); 