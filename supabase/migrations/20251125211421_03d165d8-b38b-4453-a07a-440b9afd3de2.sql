-- Add video_thumbnails column to community_insights table
ALTER TABLE community_insights 
ADD COLUMN IF NOT EXISTS video_thumbnails text[] DEFAULT NULL;

COMMENT ON COLUMN community_insights.video_thumbnails IS 'Array of thumbnail URLs corresponding to videos array';
