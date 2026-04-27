-- ===============================================================
-- MZ+ ELITE SYSTEM - MASTER DATABASE BACKUP
-- ===============================================================

-- All individual setup scripts have been merged here for organization.

-- 1. FCM TOKEN SUPPORT
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fcm_token TEXT;
CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON public.users(fcm_token);

-- 2. BEHAVIOR TRACKING
CREATE TABLE IF NOT EXISTS public.mz_offer_page_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    duration_seconds INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_tracking_user_id ON public.mz_offer_page_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_tracking_last_ping ON public.mz_offer_page_tracking(last_ping);
ALTER TABLE public.mz_offer_page_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Insert own tracking" ON public.mz_offer_page_tracking;
CREATE POLICY "Insert own tracking" ON public.mz_offer_page_tracking FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Update own tracking" ON public.mz_offer_page_tracking;
CREATE POLICY "Update own tracking" ON public.mz_offer_page_tracking FOR UPDATE USING (auth.uid() = user_id);

-- 3. PRODUCT STATS & CLICKS
CREATE TABLE IF NOT EXISTS public.product_stats (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    clicks INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, product_id)
);
ALTER TABLE public.product_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Lecture stats personnelles" ON public.product_stats;
CREATE POLICY "Lecture stats personnelles" ON public.product_stats FOR SELECT USING (true);
DROP POLICY IF EXISTS "Modif stats" ON public.product_stats;
CREATE POLICY "Modif stats" ON public.product_stats FOR ALL USING (true);
CREATE OR REPLACE FUNCTION public.mz_increment_product_clicks(p_user_id UUID, p_product_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.product_stats (user_id, product_id, clicks)
    VALUES (p_user_id, p_product_id, 1)
    ON CONFLICT (user_id, product_id)
    DO UPDATE SET clicks = product_stats.clicks + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. PREMIUM WELCOME CONFIG & POPUPS
CREATE TABLE IF NOT EXISTS public.mz_premium_welcome_config (
    id TEXT PRIMARY KEY,
    youtube_id TEXT,
    video_url TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.mz_premium_welcome_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Lecture publique premium welcome config" ON public.mz_premium_welcome_config FOR SELECT USING (true);
CREATE TABLE IF NOT EXISTS public.premium_welcome_popups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id)
);
ALTER TABLE public.premium_welcome_popups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can see their own premium popup" ON public.premium_welcome_popups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own premium popup" ON public.premium_welcome_popups FOR UPDATE USING (auth.uid() = user_id);

-- 5. TIME TRACKING & REWARDS
CREATE TABLE IF NOT EXISTS public.mz_rewards_time_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tracking_date DATE DEFAULT CURRENT_DATE,
    total_minutes INTEGER DEFAULT 0,
    last_ping TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, tracking_date)
);
ALTER TABLE public.mz_rewards_time_tracking ENABLE ROW LEVEL SECURITY;
CREATE OR REPLACE FUNCTION public.mz_rewards_heartbeat(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.mz_rewards_time_tracking (user_id, tracking_date, total_minutes, last_ping)
    VALUES (p_user_id, CURRENT_DATE, 1, now())
    ON CONFLICT (user_id, tracking_date) DO UPDATE
    SET total_minutes = mz_rewards_time_tracking.total_minutes + 1,
        last_ping = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. LEADERBOARD VIEW
DROP VIEW IF EXISTS public.mz_rewards_leaderboard_v2 CASCADE;
CREATE VIEW public.mz_rewards_leaderboard_v2 AS
WITH user_time AS (
    SELECT user_id, SUM(total_minutes) as raw_minutes
    FROM public.mz_rewards_time_tracking
    GROUP BY user_id
)
SELECT 
    u.id as user_id,
    u.full_name,
    u.user_level,
    COALESCE(ut.raw_minutes, 0)::INT as total_minutes,
    (COALESCE(u.rpa_points, 0) + COALESCE(u.rpa_balance, 0) + (COALESCE(ut.raw_minutes, 0) / 100))::BIGINT as total_score
FROM public.users u
LEFT JOIN user_time ut ON u.id = ut.user_id
WHERE u.full_name IS NOT NULL AND u.full_name NOT IN ('Ambassadeur', '---')
ORDER BY total_score DESC;

-- REFRESH SCHEMA
NOTIFY pgrst, 'reload schema';
