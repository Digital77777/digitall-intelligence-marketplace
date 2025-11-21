# Database Schema & API Documentation

## Overview

Digital Intelligence Marketplace uses **Supabase** (PostgreSQL) as its backend database with **Row Level Security (RLS)** for access control.

## Database Architecture

### Key Principles
1. **Row Level Security (RLS)** enabled on all tables
2. User data isolation via `auth.uid()`
3. Soft deletes where applicable
4. Timestamped records (`created_at`, `updated_at`)
5. Foreign key constraints for data integrity

## Core Tables

### 1. profiles

**Purpose**: Extended user information beyond auth

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  headline TEXT,
  location TEXT,
  website TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  twitter_url TEXT,
  skills TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policies**:
```sql
-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
```

**Indexes**:
```sql
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
```

### 2. subscription_tiers

**Purpose**: Define available subscription tiers

```sql
CREATE TABLE subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,  -- 'starter', 'career', 'creator'
  display_name TEXT NOT NULL,
  price DECIMAL NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  max_listings INTEGER,       -- NULL = unlimited
  max_tools_access INTEGER,   -- NULL = unlimited
  features JSONB NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Sample Data**:
```json
{
  "starter": {
    "max_listings": 5,
    "max_tools_access": 3,
    "features": ["basic_support", "community_access"]
  },
  "career": {
    "max_listings": 20,
    "max_tools_access": 10,
    "features": ["priority_support", "analytics", "certifications"]
  },
  "creator": {
    "max_listings": null,
    "max_tools_access": null,
    "features": ["premium_support", "advanced_analytics", "api_access"]
  }
}
```

### 3. user_subscriptions

**Purpose**: Track user subscription status

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users,
  tier_id UUID NOT NULL REFERENCES subscription_tiers(id),
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'cancelled', 'expired'
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policies**:
```sql
-- Users can view their own subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);
```

**Function**: Get user's tier
```sql
CREATE OR REPLACE FUNCTION get_user_tier(user_id_param UUID)
RETURNS TEXT AS $$
  SELECT st.name
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.tier_id = st.id
  WHERE us.user_id = user_id_param
    AND us.status = 'active'
    AND (us.expires_at IS NULL OR us.expires_at > now())
  ORDER BY us.created_at DESC
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
```

### 4. marketplace_listings

**Purpose**: Store marketplace products/services

```sql
CREATE TABLE marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  listing_type TEXT NOT NULL,  -- 'product', 'service', 'job'
  category_id UUID REFERENCES marketplace_categories(id),
  price DECIMAL,
  currency TEXT DEFAULT 'USD',
  delivery_time INTEGER,  -- in days
  requirements TEXT,
  tags TEXT[],
  images TEXT[],  -- Array of image URLs
  videos TEXT[],  -- Array of video URLs
  creation_link TEXT,  -- Link to use/buy the creation
  status TEXT NOT NULL DEFAULT 'draft',  -- 'draft', 'active', 'paused', 'sold'
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**RLS Policies**:
```sql
-- Anyone can view active listings
CREATE POLICY "Active listings are public"
  ON marketplace_listings FOR SELECT
  USING (status = 'active');

-- Users can view their own listings (any status)
CREATE POLICY "Users can view their own listings"
  ON marketplace_listings FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own listings
CREATE POLICY "Users can create listings"
  ON marketplace_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON marketplace_listings FOR UPDATE
  USING (auth.uid() = user_id);
```

**Indexes**:
```sql
CREATE INDEX idx_listings_user_id ON marketplace_listings(user_id);
CREATE INDEX idx_listings_category ON marketplace_listings(category_id);
CREATE INDEX idx_listings_status ON marketplace_listings(status);
CREATE INDEX idx_listings_type ON marketplace_listings(listing_type);
CREATE INDEX idx_listings_featured ON marketplace_listings(is_featured) WHERE is_featured = true;
```

### 5. community_topics

**Purpose**: Discussion forum topics

```sql
CREATE TABLE community_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  views INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 6. community_insights

**Purpose**: Blog-style posts and articles

```sql
CREATE TABLE community_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  cover_image TEXT,
  read_time TEXT,
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### 7. referrals

**Purpose**: Track referral program

```sql
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(user_id),
  referred_email TEXT NOT NULL,
  referred_user_id UUID REFERENCES profiles(user_id),
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'completed', 'expired'
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Function**: Generate referral code
```sql
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN upper(substring(md5(random()::text) from 1 for 8));
END;
$$ LANGUAGE plpgsql;
```

### 8. notifications

**Purpose**: User notifications

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  type TEXT NOT NULL,  -- 'referral', 'message', 'listing', 'system'
  message TEXT NOT NULL,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

**Function**: Create notification
```sql
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_message TEXT,
  p_metadata JSONB DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  notification_id INTEGER;
BEGIN
  INSERT INTO notifications (user_id, type, message, metadata)
  VALUES (p_user_id, p_type, p_message, p_metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Database Functions

### 1. User Tier Check

```sql
CREATE OR REPLACE FUNCTION get_user_tier(user_id_param UUID)
RETURNS TEXT AS $$
  SELECT st.name
  FROM user_subscriptions us
  JOIN subscription_tiers st ON us.tier_id = st.id
  WHERE us.user_id = user_id_param
    AND us.status = 'active'
  ORDER BY us.created_at DESC
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
```

### 2. Error Logging

```sql
CREATE OR REPLACE FUNCTION log_error(
  p_error_message TEXT,
  p_error_context JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO error_log (error_message, error_context, error_timestamp)
  VALUES (p_error_message, p_error_context, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 3. Get User Contributions

```sql
CREATE OR REPLACE FUNCTION get_user_contributions(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_contributions INTEGER;
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM community_topics WHERE user_id = p_user_id) +
    (SELECT COUNT(*) FROM community_insights WHERE user_id = p_user_id AND is_published = true) +
    (SELECT COUNT(*) FROM topic_replies WHERE user_id = p_user_id)
  INTO total_contributions;
  
  RETURN total_contributions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Triggers

### 1. Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Profile Creation Trigger

```sql
CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_for_new_user();
```

## Query Patterns

### Fetching User Data

```typescript
// Get user profile
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

// Get user with subscription
const { data: userData } = await supabase
  .from('profiles')
  .select(`
    *,
    user_subscriptions (
      *,
      subscription_tiers (*)
    )
  `)
  .eq('user_id', userId)
  .single();
```

### Fetching Marketplace Listings

```typescript
// Get active listings with filters
const { data: listings } = await supabase
  .from('marketplace_listings')
  .select(`
    *,
    profiles (
      full_name,
      avatar_url
    )
  `)
  .eq('status', 'active')
  .eq('listing_type', 'product')
  .order('created_at', { ascending: false })
  .range(0, 9);  // Pagination

// Search listings
const { data: results } = await supabase
  .from('marketplace_listings')
  .select('*')
  .textSearch('title', searchTerm)
  .eq('status', 'active');
```

### Community Queries

```typescript
// Get topics with reply count
const { data: topics } = await supabase
  .from('community_topics')
  .select(`
    *,
    profiles (full_name, avatar_url),
    topic_replies (count)
  `)
  .order('last_activity_at', { ascending: false });

// Get user insights
const { data: insights } = await supabase
  .from('community_insights')
  .select('*')
  .eq('user_id', userId)
  .eq('is_published', true)
  .order('created_at', { ascending: false });
```

## Security Considerations

### Row Level Security (RLS)

**Always Enabled**: Every table has RLS enabled
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```

**Common Policy Patterns**:

1. **Public Read, Owner Write**:
```sql
CREATE POLICY "Public read" ON table_name FOR SELECT USING (true);
CREATE POLICY "Owner write" ON table_name FOR UPDATE 
  USING (auth.uid() = user_id);
```

2. **Owner Only**:
```sql
CREATE POLICY "Owner access" ON table_name 
  FOR ALL USING (auth.uid() = user_id);
```

3. **Role-Based**:
```sql
CREATE POLICY "Admin access" ON table_name
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

### Input Validation

**Client-side** (Zod schemas):
```typescript
import { z } from 'zod';

export const listingSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(5000),
  price: z.number().positive().optional(),
  tags: z.array(z.string()).max(10),
});
```

**Server-side** (Edge Functions):
```typescript
// Validate before database insert
const validatedData = listingSchema.parse(requestBody);
```

## Backup & Recovery

### Automated Backups
- Supabase handles automatic daily backups
- Point-in-time recovery available
- Can be configured in Supabase dashboard

### Manual Backup
```bash
# Using pg_dump (if self-hosting)
pg_dump -U postgres -h db.project.supabase.co dbname > backup.sql
```

## Performance Optimization

### Indexes
```sql
-- Composite indexes for common queries
CREATE INDEX idx_listings_status_type 
  ON marketplace_listings(status, listing_type);

CREATE INDEX idx_listings_user_status 
  ON marketplace_listings(user_id, status);
```

### Materialized Views (Future)
```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  user_id,
  COUNT(*) FILTER (WHERE type = 'listing') as total_listings,
  COUNT(*) FILTER (WHERE type = 'insight') as total_insights
FROM (
  SELECT user_id, 'listing' as type FROM marketplace_listings
  UNION ALL
  SELECT user_id, 'insight' as type FROM community_insights
) combined
GROUP BY user_id;
```

## Migration Strategy

### Version Control
- All migrations stored in `supabase/migrations/`
- Numbered sequentially: `20240101000000_initial_schema.sql`
- Applied automatically by Supabase

### Sample Migration
```sql
-- Migration: Add tags to listings
-- Created: 2024-11-21

ALTER TABLE marketplace_listings 
ADD COLUMN IF NOT EXISTS tags TEXT[];

CREATE INDEX idx_listings_tags 
  ON marketplace_listings USING GIN(tags);
```

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Security Guide](./SECURITY.md)
