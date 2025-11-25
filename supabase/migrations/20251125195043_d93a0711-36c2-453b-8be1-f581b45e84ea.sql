-- Create job_applications table
CREATE TABLE public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  applicant_id uuid NOT NULL,
  cover_letter text,
  resume_url text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(job_listing_id, applicant_id)
);

-- Enable RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Applicants can view their own applications"
ON public.job_applications
FOR SELECT
USING (auth.uid() = applicant_id);

CREATE POLICY "Job owners can view applications for their jobs"
ON public.job_applications
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_listings
    WHERE id = job_applications.job_listing_id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can apply to jobs"
ON public.job_applications
FOR INSERT
WITH CHECK (auth.uid() = applicant_id);

CREATE POLICY "Applicants can update their own applications"
ON public.job_applications
FOR UPDATE
USING (auth.uid() = applicant_id);

CREATE POLICY "Applicants can delete their own applications"
ON public.job_applications
FOR DELETE
USING (auth.uid() = applicant_id);

CREATE POLICY "Job owners can update application status"
ON public.job_applications
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.marketplace_listings
    WHERE id = job_applications.job_listing_id
    AND user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();