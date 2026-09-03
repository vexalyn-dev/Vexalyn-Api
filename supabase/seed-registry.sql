-- VEXALYN API — Phase 09 Registry Seed Data
-- DEVELOPMENT ONLY — Insert into existing tables

-- ============================================================================
-- SEED APIs
-- ============================================================================

INSERT INTO apis (name, slug, description, version, status, category, icon, enabled, base_url)
VALUES
    ('Donghua API', 'donghua', 'Comprehensive donghua and Chinese animation data including titles, episodes, streams, schedules, and metadata from multiple providers.', 'v1', 'enabled', 'entertainment', 'Filmstrip', true, 'https://api.vexalyn.dev/v1/donghua'),
    ('Anime API', 'anime', 'Japanese anime catalog with episode data, streaming links, genres, schedules, and detailed metadata.', 'v2', 'enabled', 'entertainment', 'Play', true, 'https://api.vexalyn.dev/v1/anime'),
    ('Manga API', 'manga', 'Manga and manhwa data with chapter tracking, reading lists, genres, and release schedules.', 'v1', 'development', 'entertainment', 'BookOpen', true, 'https://api.vexalyn.dev/v1/manga'),
    ('AI API', 'ai', 'AI-powered recommendations, similarity search, content classification, and intelligent metadata enrichment.', 'v1', 'beta', 'ai', 'Brain', true, 'https://api.vexalyn.dev/v1/ai'),
    ('Image API', 'image', 'AI-powered image generation, enhancement, and processing for media thumbnails and artwork.', 'v1', 'beta', 'ai', 'Image', true, 'https://api.vexalyn.dev/v1/image'),
    ('Utility API', 'utility', 'Helpers for scraping, validation, data normalization, health checks, and developer utilities.', 'v1', 'enabled', 'utility', 'Settings', true, 'https://api.vexalyn.dev/v1/util'),
    ('Search API', 'search', 'Universal search across all media categories with filters, suggestions, and relevance ranking.', 'v1', 'enabled', 'utility', 'Search', true, 'https://api.vexalyn.dev/v1/search')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- SEED ENDPOINTS
-- ============================================================================

-- Donghua API endpoints
INSERT INTO api_endpoints (api_id, slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema, example_request, example_response)
SELECT
    a.id,
    ep.slug, ep.path, ep.method, ep.description,
    ep.authentication_required, ep.permissions, ep.is_public,
    ep.request_schema, ep.response_schema, ep.example_request, ep.example_response
FROM (
    VALUES
        ('latest', '/latest', 'GET', 'Get the latest donghua updates and newest episodes', true, '["api.read"]', true,
         '{"query": {"limit": {"type": "integer", "default": 20, "max": 100}, "page": {"type": "integer", "default": 1}}}',
         '{"data": {"items": [{"title": "string", "url": "string", "episode": "string", "thumbnail": "string", "type": "string", "status": "string"}]}, "meta": {"total": "integer", "page": "integer"}}',
         'GET /v1/donghua/latest?limit=20&page=1',
         '{"success": true, "data": {"items": [...]}, "meta": {"total": 98, "page": 1}}'),
        ('search', '/search', 'GET', 'Search donghua by keyword with filters', true, '["api.read"]', true,
         '{"query": {"keyword": {"type": "string", "required": true}, "genre": {"type": "string"}, "status": {"type": "string", "enum": ["ongoing", "completed", "hiatus"]}, "limit": {"type": "integer", "default": 20}}}',
         '{"data": {"items": [{"title": "string", "url": "string", "thumbnail": "string", "type": "string", "status": "string"}]}, "meta": {"total": "integer"}}',
         'GET /v1/donghua/search?keyword=perfect+world',
         '{"success": true, "data": {"items": [...]}, "meta": {"total": 5}}'),
        ('detail', '/detail/:slug', 'GET', 'Get detailed information about a donghua including synopsis, genres, rating', true, '["api.read"]', true,
         '{"params": {"slug": {"type": "string", "required": true}}}',
         '{"data": {"title": "string", "url": "string", "rating": "number", "thumbnail": "string", "genres": ["string"], "synopsis": "string", "status": "string", "episodes": "integer"}}',
         'GET /v1/donghua/detail/perfect-world',
         '{"success": true, "data": {"title": "Perfect World", "rating": 8.5, ...}}'),
        ('stream', '/stream/:slug', 'GET', 'Resolve stream URLs and available servers for an episode', true, '["api.execute"]', true,
         '{"params": {"slug": {"type": "string", "required": true}}}',
         '{"data": {"title": "string", "url": "string", "servers": [{"name": "string", "url": "string"}]}}',
         'GET /v1/donghua/stream/perfect-world-episode-1',
         '{"success": true, "data": {"servers": [...]}}'),
        ('popular', '/popular', 'GET', 'Get most popular donghua by view count', true, '["api.read"]', true,
         '{"query": {"limit": {"type": "integer", "default": 20}}}',
         '{"data": {"items": [{"title": "string", "url": "string", "views": "integer"}]}}',
         'GET /v1/donghua/popular',
         '{"success": true, "data": {"items": [...]}}'),
        ('schedule', '/schedule', 'GET', 'Get release schedule for upcoming episodes', true, '["api.read"]', true,
         '{"query": {"date": {"type": "string", "format": "YYYY-MM-DD"}}}',
         '{"data": {"schedule": [{"day": "string", "items": [...]}]}}',
         'GET /v1/donghua/schedule?date=2024-01-15',
         '{"success": true, "data": {"schedule": [...]}}')
) AS ep(slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema, example_request, example_response)
JOIN apis a ON a.slug = 'donghua';

-- Anime API endpoints
INSERT INTO api_endpoints (api_id, slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema)
SELECT
    a.id,
    ep.slug, ep.path, ep.method, ep.description,
    ep.authentication_required, ep.permissions, ep.is_public,
    ep.request_schema, ep.response_schema
FROM (
    VALUES
        ('latest', '/latest', 'GET', 'Get the latest anime updates', true, '["api.read"]', true,
         '{"query": {"limit": {"type": "integer", "default": 20}}}',
         '{"data": {"items": [{"title": "string", "url": "string", "episode": "string"}]}}'),
        ('search', '/search', 'GET', 'Search anime by keyword', true, '["api.read"]', true,
         '{"query": {"keyword": {"type": "string", "required": true}}}',
         '{"data": {"items": [{"title": "string", "url": "string"}]}}'),
        ('genre', '/genre/:slug', 'GET', 'Get anime by genre', true, '["api.read"]', true,
         '{"params": {"slug": {"type": "string", "required": true}}}',
         '{"data": {"items": [{"title": "string", "url": "string"}]}}')
) AS ep(slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema)
JOIN apis a ON a.slug = 'anime';

-- AI API endpoints
INSERT INTO api_endpoints (api_id, slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema)
SELECT
    a.id,
    ep.slug, ep.path, ep.method, ep.description,
    ep.authentication_required, ep.permissions, ep.is_public,
    ep.request_schema, ep.response_schema
FROM (
    VALUES
        ('recommend', '/recommend', 'POST', 'Get AI-powered recommendations based on preferences', true, '["api.execute"]', true,
         '{"body": {"preferences": {"type": "object", "required": true}, "limit": {"type": "integer", "default": 10}}}',
         '{"data": {"recommendations": [{"title": "string", "score": "number", "reason": "string"}]}}'),
        ('classify', '/classify', 'POST', 'Classify media content into categories', true, '["api.execute"]', true,
         '{"body": {"title": {"type": "string", "required": true}}}',
         '{"data": {"categories": ["string"], "confidence": "number"}}'),
        ('similar', '/similar/:id', 'GET', 'Find similar titles using AI similarity search', true, '["api.read"]', true,
         '{"params": {"id": {"type": "string", "required": true}}}',
         '{"data": {"similar": [{"title": "string", "score": "number"}]}}')
) AS ep(slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema)
JOIN apis a ON a.slug = 'ai';

-- Utility API endpoints
INSERT INTO api_endpoints (api_id, slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema)
SELECT
    a.id,
    ep.slug, ep.path, ep.method, ep.description,
    ep.authentication_required, ep.permissions, ep.is_public,
    ep.request_schema, ep.response_schema
FROM (
    VALUES
        ('health', '/health', 'GET', 'Health check endpoint', false, '[]', true,
         '{}',
         '{"status": "string", "uptime": "integer", "version": "string"}'),
        ('validate', '/validate', 'POST', 'Validate input data against schema', true, '["api.execute"]', true,
         '{"body": {"schema": {"type": "object", "required": true}, "data": {"type": "object", "required": true}}}',
         '{"data": {"valid": "boolean", "errors": ["string"]}}'),
        ('parse', '/parse', 'POST', 'Parse HTML content and extract structured data', true, '["api.execute"]', true,
         '{"body": {"url": {"type": "string", "required": true}, "selectors": {"type": "object"}}}',
         '{"data": {"parsed": {"fields": "object"}}}')
) AS ep(slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema)
JOIN apis a ON a.slug = 'utility';

-- Search API endpoints
INSERT INTO api_endpoints (api_id, slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema)
SELECT
    a.id,
    ep.slug, ep.path, ep.method, ep.description,
    ep.authentication_required, ep.permissions, ep.is_public,
    ep.request_schema, ep.response_schema
FROM (
    VALUES
        ('search', '/search', 'GET', 'Universal search across all media categories', true, '["api.read"]', true,
         '{"query": {"q": {"type": "string", "required": true}, "category": {"type": "string"}, "limit": {"type": "integer", "default": 20}}}',
         '{"data": {"results": [{"title": "string", "type": "string", "url": "string", "category": "string"}], "suggestions": ["string"]}}')
) AS ep(slug, path, method, description, authentication_required, permissions, is_public, request_schema, response_schema)
JOIN apis a ON a.slug = 'search';

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================
