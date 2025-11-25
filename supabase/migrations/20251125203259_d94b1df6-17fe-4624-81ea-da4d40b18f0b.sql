-- Create strategy_sessions table for booking management
CREATE TABLE public.strategy_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL,
  session_time TEXT NOT NULL,
  topic TEXT,
  consultant TEXT,
  meeting_link TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.strategy_sessions ENABLE ROW LEVEL SECURITY;

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions"
ON public.strategy_sessions
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create their own sessions"
ON public.strategy_sessions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions"
ON public.strategy_sessions
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can cancel their own sessions
CREATE POLICY "Users can delete their own sessions"
ON public.strategy_sessions
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can manage all sessions
CREATE POLICY "Admins can manage all sessions"
ON public.strategy_sessions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_strategy_sessions_updated_at
BEFORE UPDATE ON public.strategy_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();