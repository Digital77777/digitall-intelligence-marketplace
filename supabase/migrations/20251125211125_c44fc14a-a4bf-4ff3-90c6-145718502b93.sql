-- Add videos column to community_insights table
ALTER TABLE community_insights 
ADD COLUMN IF NOT EXISTS videos text[] DEFAULT NULL;

COMMENT ON COLUMN community_insights.videos IS 'Array of video URLs for the insight';
