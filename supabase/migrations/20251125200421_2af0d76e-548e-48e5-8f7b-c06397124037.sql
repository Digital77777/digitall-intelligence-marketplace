-- Create AI Development Projects table
CREATE TABLE public.ai_development_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  project_type TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  budget_min NUMERIC,
  budget_max NUMERIC,
  currency TEXT DEFAULT 'USD',
  timeline TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  target_industry TEXT,
  technologies TEXT[] DEFAULT '{}',
  attachments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_development_projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own AI projects"
ON public.ai_development_projects
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI projects"
ON public.ai_development_projects
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own AI projects"
ON public.ai_development_projects
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own draft projects"
ON public.ai_development_projects
FOR DELETE
USING (auth.uid() = user_id AND status = 'draft');

-- Admins can view all projects
CREATE POLICY "Admins can view all AI projects"
ON public.ai_development_projects
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_ai_development_projects_updated_at
BEFORE UPDATE ON public.ai_development_projects
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();