-- Create freelancer_proposals table for the hire/proposal system
CREATE TABLE public.freelancer_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  freelancer_profile_id UUID NOT NULL REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE,
  freelancer_user_id UUID NOT NULL,
  client_id UUID NOT NULL,
  project_title TEXT NOT NULL,
  project_description TEXT NOT NULL,
  budget_type TEXT NOT NULL CHECK (budget_type IN ('fixed', 'hourly')),
  budget_amount NUMERIC NOT NULL CHECK (budget_amount > 0),
  estimated_hours INTEGER,
  timeline TEXT NOT NULL,
  deadline DATE,
  attachments TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled')),
  client_message TEXT,
  freelancer_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.freelancer_proposals ENABLE ROW LEVEL SECURITY;

-- Clients can view their own sent proposals
CREATE POLICY "Clients can view their own proposals"
ON public.freelancer_proposals
FOR SELECT
USING (auth.uid() = client_id);

-- Freelancers can view proposals sent to them
CREATE POLICY "Freelancers can view proposals for their profiles"
ON public.freelancer_proposals
FOR SELECT
USING (auth.uid() = freelancer_user_id);

-- Clients can create proposals
CREATE POLICY "Clients can create proposals"
ON public.freelancer_proposals
FOR INSERT
WITH CHECK (auth.uid() = client_id);

-- Clients can update their own pending proposals
CREATE POLICY "Clients can update their pending proposals"
ON public.freelancer_proposals
FOR UPDATE
USING (auth.uid() = client_id AND status = 'pending')
WITH CHECK (auth.uid() = client_id);

-- Freelancers can update proposals sent to them (to accept/reject)
CREATE POLICY "Freelancers can respond to proposals"
ON public.freelancer_proposals
FOR UPDATE
USING (auth.uid() = freelancer_user_id)
WITH CHECK (auth.uid() = freelancer_user_id);

-- Clients can delete their own pending proposals
CREATE POLICY "Clients can delete their pending proposals"
ON public.freelancer_proposals
FOR DELETE
USING (auth.uid() = client_id AND status = 'pending');

-- Create index for faster queries
CREATE INDEX idx_proposals_freelancer_user ON public.freelancer_proposals(freelancer_user_id);
CREATE INDEX idx_proposals_client ON public.freelancer_proposals(client_id);
CREATE INDEX idx_proposals_status ON public.freelancer_proposals(status);

-- Trigger for updated_at
CREATE TRIGGER update_freelancer_proposals_updated_at
  BEFORE UPDATE ON public.freelancer_proposals
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();