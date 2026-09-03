-- VEXALYN API — Seed Data (DEVELOPMENT ONLY)
-- This file contains minimal development seed data.
-- Do NOT use in production.

-- ============================================================================
-- SEED DATA: Development Only
-- ============================================================================

-- Insert a development profile (use real auth.uid() in production)
INSERT INTO profiles (id, email, full_name, role, subscription_tier)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'dev@vexalyn.test',
    'Development User',
    'admin',
    'free'
) ON CONFLICT (id) DO NOTHING;

-- Insert development projects
INSERT INTO projects (name, description, slug, owner_id)
VALUES
    ('My First Project', 'Development project for testing', 'my-first-project', '00000000-0000-0000-0000-000000000001'::uuid),
    ('Production API', 'Main production project', 'production-api', '00000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (slug) DO NOTHING;

-- Insert development APIs
INSERT INTO apis (name, slug, description, version, status, rate_limit_default)
VALUES
    ('Donghua API', 'donghua', 'Donghua and Chinese animation data', 'v1', 'production', 60),
    ('Anime API', 'anime', 'Japanese anime data', 'v2', 'development', 60),
    ('Manga API', 'manga', 'Manga and manhwa data', 'v1', 'development', 60),
    ('AI API', 'ai', 'AI-powered recommendations and classification', 'v1', 'beta', 30),
    ('Utility API', 'utility', 'Helpers and utilities', 'v1', 'production', 120)
ON CONFLICT (slug) DO NOTHING;

-- Insert development providers
INSERT INTO api_providers (name, slug, base_url, category, status)
VALUES
    ('Anichin', 'anichin', 'https://anichin.moe', 'donghua', 'production'),
    ('Animexin', 'animexin', 'https://animexin.dev', 'donghua', 'production')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
