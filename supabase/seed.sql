-- VEXALYN API — Seed Data (DEVELOPMENT ONLY)
-- This file contains minimal development seed data.
-- Do NOT use in production.
-- NOTE: profiles require a real auth.user — create one via dashboard signup first.

-- ============================================================================
-- SEED DATA: Development Only
-- ============================================================================

-- Insert development APIs
INSERT INTO apis (name, slug, description, version, status, rate_limit_default, category, icon, enabled)
VALUES
    ('Donghua API', 'donghua', 'Donghua and Chinese animation data', 'v1', 'production', 60, 'donghua', 'PlayCircle', true),
    ('Anime API', 'anime', 'Japanese anime data', 'v2', 'development', 60, 'anime', 'Anime', true),
    ('Manga API', 'manga', 'Manga and manhwa data', 'v1', 'development', 60, 'manga', 'BookOpen', true),
    ('AI API', 'ai', 'AI-powered recommendations and classification', 'v1', 'staging', 30, 'ai', 'Cpu', true),
    ('Utility API', 'utility', 'Helpers and utilities', 'v1', 'production', 120, 'utility', 'Zap', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert development providers
INSERT INTO api_providers (name, slug, base_url, category, status, enabled)
VALUES
    ('Anichin', 'anichin', 'https://anichin.moe', 'donghua', 'production', true),
    ('Animexin', 'animexin', 'https://animexin.dev', 'donghua', 'production', true)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
