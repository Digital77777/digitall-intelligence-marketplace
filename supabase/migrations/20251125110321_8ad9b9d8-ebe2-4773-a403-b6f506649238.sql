-- Create storage bucket for freelancer profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'freelancer-profiles',
  'freelancer-profiles',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- RLS Policy: Anyone can view profile pictures (public bucket)
CREATE POLICY "Anyone can view freelancer profile pictures"
ON storage.objects
FOR SELECT
USING (bucket_id = 'freelancer-profiles');

-- RLS Policy: Authenticated users can upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'freelancer-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'freelancer-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS Policy: Users can delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'freelancer-profiles' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);