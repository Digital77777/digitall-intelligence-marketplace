-- Create freelancer_profiles table
CREATE TABLE public.freelancer_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  hourly_rate NUMERIC NOT NULL,
  experience TEXT,
  location TEXT,
  skills TEXT[] NOT NULL DEFAULT '{}',
  languages TEXT[] NOT NULL DEFAULT '{}',
  portfolio_items JSONB DEFAULT '[]',
  availability TEXT,
  profile_picture TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all active freelancer profiles (for browsing)
CREATE POLICY "Anyone can view active freelancer profiles"
ON public.freelancer_profiles
FOR SELECT
USING (is_active = true);

-- Policy: Users can create their own freelancer profile
CREATE POLICY "Users can create their own freelancer profile"
ON public.freelancer_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own freelancer profile
CREATE POLICY "Users can update their own freelancer profile"
ON public.freelancer_profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own freelancer profile
CREATE POLICY "Users can delete their own freelancer profile"
ON public.freelancer_profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_freelancer_profiles_updated_at
BEFORE UPDATE ON public.freelancer_profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();