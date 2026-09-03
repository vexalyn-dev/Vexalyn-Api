-- VEXALYN API — Phase 09: API Registry Extension
-- Extends existing tables for public API catalog registry

-- ============================================================================
-- EXTENDED ENUMS
-- ============================================================================

-- Add 'enabled' status to api_status if not already present
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'enabled') THEN
        ALTER TYPE api_status ADD VALUE 'enabled';
    END IF;
END $$;

-- ============================================================================
-- EXTEND apis TABLE
-- ============================================================================

ALTER TABLE apis ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'utility';
ALTER TABLE apis ADD COLUMN IF NOT EXISTS icon TEXT NOT NULL DEFAULT 'Zap';
ALTER TABLE apis ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE apis ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add index for filtering
CREATE INDEX IF NOT EXISTS idx_apis_category ON apis(category);
CREATE INDEX IF NOT EXISTS idx_apis_enabled ON apis(enabled);

-- ============================================================================
-- EXTEND api_endpoints TABLE
-- ============================================================================

ALTER TABLE api_endpoints ADD COLUMN IF NOT EXISTS slug TEXT NOT NULL DEFAULT '';
ALTER TABLE api_endpoints ADD COLUMN IF NOT EXISTS authentication_required BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE api_endpoints ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '["api.read"]';
ALTER TABLE api_endpoints ADD COLUMN IF NOT EXISTS request_schema JSONB;
ALTER TABLE api_endpoints ADD COLUMN IF NOT EXISTS response_schema JSONB;
ALTER TABLE api_endpoints ADD COLUMN IF NOT EXISTS example_request TEXT;
ALTER TABLE api_endpoints ADD COLUMN IF NOT EXISTS example_response TEXT;

-- Update slug default for existing rows
UPDATE api_endpoints SET slug = path WHERE slug = '';

-- Add index
CREATE INDEX IF NOT EXISTS idx_api_endpoints_slug ON api_endpoints(slug);
CREATE INDEX IF NOT EXISTS idx_api_endpoints_enabled ON api_endpoints(is_public);

-- ============================================================================
-- EXTEND api_providers TABLE
-- ============================================================================

ALTER TABLE api_providers ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE api_providers ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE api_providers ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT true;

-- ============================================================================
-- FUNCTION: get_api_with_endpoints
-- ============================================================================

CREATE OR REPLACE FUNCTION get_api_with_endpoints(p_slug TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    version TEXT,
    status api_status,
    base_url TEXT,
    category TEXT,
    icon TEXT,
    enabled BOOLEAN,
    endpoint_count INTEGER,
    providers JSONB,
    endpoints JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        a.slug,
        a.description,
        a.version,
        a.status,
        a.base_url,
        a.category,
        a.icon,
        a.enabled,
        COUNT(e.id)::INTEGER,
        COALESCE(
            (SELECT json_agg(json_build_object(
                'id', p.id,
                'name', p.name,
                'slug', p.slug,
                'base_url', p.base_url,
                'status', p.status
            ))
            FROM api_providers p
            WHERE p.category = a.category AND p.enabled = true),
            '[]'::jsonb
        ),
        COALESCE(
            (SELECT json_agg(json_build_object(
                'id', ep.id,
                'slug', ep.slug,
                'name', ep.path,
                'path', ep.path,
                'method', ep.method,
                'description', ep.description,
                'authentication_required', ep.authentication_required,
                'permissions', ep.permissions,
                'request_schema', ep.request_schema,
                'response_schema', ep.response_schema,
                'example_request', ep.example_request,
                'example_response', ep.example_response
            ))
            FROM api_endpoints ep
            WHERE ep.api_id = a.id AND ep.is_public = true
            ORDER BY ep.path),
            '[]'::jsonb
        ),
        a.created_at,
        a.updated_at
    FROM apis a
    LEFT JOIN api_endpoints ep ON ep.api_id = a.id AND ep.is_public = true
    WHERE a.slug = p_slug
    GROUP BY a.id, a.name, a.slug, a.description, a.version, a.status,
             a.base_url, a.category, a.icon, a.enabled, a.created_at, a.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCTION: list_apis
-- ============================================================================

CREATE OR REPLACE FUNCTION list_apis(
    p_category TEXT DEFAULT NULL,
    p_enabled BOOLEAN DEFAULT true,
    p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    description TEXT,
    version TEXT,
    status api_status,
    category TEXT,
    icon TEXT,
    endpoint_count INTEGER,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id,
        a.name,
        a.slug,
        a.description,
        a.version,
        a.status,
        a.category,
        a.icon,
        COUNT(ep.id)::INTEGER,
        a.created_at
    FROM apis a
    LEFT JOIN api_endpoints ep ON ep.api_id = a.id AND ep.is_public = true
    WHERE a.enabled = p_enabled
      AND (p_category IS NULL OR a.category = p_category)
      AND (p_search IS NULL OR a.name ILIKE '%' || p_search || '%' OR a.description ILIKE '%' || p_search || '%')
    GROUP BY a.id, a.name, a.slug, a.description, a.version, a.status,
             a.category, a.icon, a.created_at
    ORDER BY a.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
