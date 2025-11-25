-- Create table for AI tutor chat sessions
CREATE TABLE public.ai_tutor_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for chat messages
CREATE TABLE public.ai_tutor_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.ai_tutor_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_tutor_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for sessions
CREATE POLICY "Users can view their own sessions" 
ON public.ai_tutor_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions" 
ON public.ai_tutor_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.ai_tutor_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.ai_tutor_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for messages
CREATE POLICY "Users can view their own messages" 
ON public.ai_tutor_messages FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.ai_tutor_sessions 
  WHERE id = ai_tutor_messages.session_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create messages in their sessions" 
ON public.ai_tutor_messages FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.ai_tutor_sessions 
  WHERE id = ai_tutor_messages.session_id AND user_id = auth.uid()
));

-- Indexes for performance
CREATE INDEX idx_ai_tutor_sessions_user_id ON public.ai_tutor_sessions(user_id);
CREATE INDEX idx_ai_tutor_messages_session_id ON public.ai_tutor_messages(session_id);

-- Trigger to update session updated_at
CREATE TRIGGER update_ai_tutor_sessions_updated_at
BEFORE UPDATE ON public.ai_tutor_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_modified_column();