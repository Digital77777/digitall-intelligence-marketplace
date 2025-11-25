-- Create freelancer_reviews table for ratings and reviews
CREATE TABLE public.freelancer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_profile_id UUID NOT NULL REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE,
  freelancer_user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  proposal_id UUID REFERENCES public.freelancer_proposals(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT NOT NULL CHECK (char_length(title) <= 100),
  review_text TEXT NOT NULL CHECK (char_length(review_text) <= 1000),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(proposal_id, client_id)
);

-- Enable RLS
ALTER TABLE public.freelancer_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews"
ON public.freelancer_reviews
FOR SELECT
USING (true);

-- Clients can create reviews (only for completed proposals they own)
CREATE POLICY "Clients can create reviews"
ON public.freelancer_reviews
FOR INSERT
WITH CHECK (
  auth.uid() = client_id AND
  (
    proposal_id IS NULL OR
    EXISTS (
      SELECT 1 FROM public.freelancer_proposals
      WHERE id = proposal_id
      AND client_id = auth.uid()
      AND status = 'completed'
    )
  )
);

-- Clients can update their own reviews
CREATE POLICY "Clients can update their own reviews"
ON public.freelancer_reviews
FOR UPDATE
USING (auth.uid() = client_id)
WITH CHECK (auth.uid() = client_id);

-- Clients can delete their own reviews
CREATE POLICY "Clients can delete their own reviews"
ON public.freelancer_reviews
FOR DELETE
USING (auth.uid() = client_id);

-- Create indexes for performance
CREATE INDEX idx_reviews_freelancer_profile ON public.freelancer_reviews(freelancer_profile_id);
CREATE INDEX idx_reviews_freelancer_user ON public.freelancer_reviews(freelancer_user_id);
CREATE INDEX idx_reviews_client ON public.freelancer_reviews(client_id);
CREATE INDEX idx_reviews_rating ON public.freelancer_reviews(rating);

-- Function to get freelancer average rating
CREATE OR REPLACE FUNCTION public.get_freelancer_rating(p_freelancer_profile_id UUID)
RETURNS TABLE(average_rating NUMERIC, total_reviews BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ROUND(AVG(rating)::NUMERIC, 1) as average_rating,
    COUNT(*) as total_reviews
  FROM public.freelancer_reviews
  WHERE freelancer_profile_id = p_freelancer_profile_id;
$$;

-- Trigger for updated_at
CREATE TRIGGER update_freelancer_reviews_updated_at
  BEFORE UPDATE ON public.freelancer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();