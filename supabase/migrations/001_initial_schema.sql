-- VEXALYN API — Phase 04 Supabase Database Foundation
-- Run with: supabase db push

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE api_status AS ENUM ('development', 'staging', 'production', 'archived');
CREATE TYPE key_status AS ENUM ('active', 'revoked', 'expired');
CREATE TYPE key_environment AS ENUM ('development', 'production');
CREATE TYPE request_method AS ENUM ('GET', 'POST', 'PUT', 'DELETE', 'PATCH');
CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE notification_type AS ENUM ('rate_limit', 'key_expired', 'usage_alert', 'system');
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles: extends auth.users with application-level data
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    company TEXT,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
    subscription_tier subscription_tier NOT NULL DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- projects: organizational unit for API keys and requests
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    logo_url TEXT,
    settings JSONB DEFAULT '{}',
    status api_status NOT NULL DEFAULT 'development',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- apis: top-level API definitions (donghua, anime, manga, ai, utility)
CREATE TABLE apis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    version TEXT NOT NULL DEFAULT 'v1',
    status api_status NOT NULL DEFAULT 'development',
    base_url TEXT,
    rate_limit_default INTEGER DEFAULT 60,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- api_providers: underlying scraper providers (anichin, animexin, etc.)
CREATE TABLE api_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    base_url TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'donghua',
    status api_status NOT NULL DEFAULT 'development',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- api_endpoints: individual endpoints within each API
CREATE TABLE api_endpoints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_id UUID NOT NULL REFERENCES apis(id) ON DELETE CASCADE,
    provider_id UUID REFERENCES api_providers(id) ON DELETE SET NULL,
    path TEXT NOT NULL,
    method request_method NOT NULL DEFAULT 'GET',
    description TEXT,
    is_public BOOLEAN NOT NULL DEFAULT false,
    rate_limit_override INTEGER,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(api_id, path, method)
);

-- api_keys: hashed API keys (never store raw keys)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL,
    key_hash TEXT NOT NULL,
    environment key_environment NOT NULL DEFAULT 'production',
    status key_status NOT NULL DEFAULT 'active',
    rate_limit INTEGER,
    permissions JSONB DEFAULT '[]',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- api_key_permissions: granular permissions per key
CREATE TABLE api_key_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    api_id UUID REFERENCES apis(id) ON DELETE CASCADE,
    endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE CASCADE,
    allowed_methods request_method[],
    rate_limit_override INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(api_key_id, api_id, endpoint_id)
);

-- api_requests: individual request logs
CREATE TABLE api_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id TEXT NOT NULL UNIQUE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    api_id UUID REFERENCES apis(id) ON DELETE SET NULL,
    endpoint_id UUID REFERENCES api_endpoints(id) ON DELETE SET NULL,
    method request_method NOT NULL,
    path TEXT NOT NULL,
    query_params TEXT,
    request_body TEXT,
    status_code INTEGER NOT NULL,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    ip_hash TEXT NOT NULL,
    user_agent TEXT,
    error_message TEXT,
    response_size_bytes INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- usage_records: aggregated usage per day per key
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    api_id UUID REFERENCES apis(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    total_requests INTEGER NOT NULL DEFAULT 0,
    successful_requests INTEGER NOT NULL DEFAULT 0,
    failed_requests INTEGER NOT NULL DEFAULT 0,
    total_latency_ms BIGINT NOT NULL DEFAULT 0,
    bytes_sent BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(profile_id, api_key_id, api_id, date)
);

-- subscriptions: subscription plan details
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    tier subscription_tier NOT NULL DEFAULT 'free',
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT UNIQUE,
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- notifications: user notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    status notification_status NOT NULL DEFAULT 'unread',
    data JSONB DEFAULT '{}',
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- profiles
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);

-- projects
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_status ON projects(status);

-- apis
CREATE INDEX idx_apis_slug ON apis(slug);
CREATE INDEX idx_apis_status ON apis(status);

-- api_providers
CREATE INDEX idx_api_providers_slug ON api_providers(slug);
CREATE INDEX idx_api_providers_category ON api_providers(category);
CREATE INDEX idx_api_providers_status ON api_providers(status);

-- api_endpoints
CREATE INDEX idx_api_endpoints_api_id ON api_endpoints(api_id);
CREATE INDEX idx_api_endpoints_provider_id ON api_endpoints(provider_id);
CREATE INDEX idx_api_endpoints_path ON api_endpoints(path);

-- api_keys
CREATE INDEX idx_api_keys_project_id ON api_keys(project_id);
CREATE INDEX idx_api_keys_prefix ON api_keys(prefix);
CREATE INDEX idx_api_keys_status ON api_keys(status);
CREATE INDEX idx_api_keys_last_used_at ON api_keys(last_used_at);
CREATE INDEX idx_api_keys_expires_at ON api_keys(expires_at);

-- api_key_permissions
CREATE INDEX idx_api_key_permissions_api_key_id ON api_key_permissions(api_key_id);
CREATE INDEX idx_api_key_permissions_api_id ON api_key_permissions(api_id);
CREATE INDEX idx_api_key_permissions_endpoint_id ON api_key_permissions(endpoint_id);

-- api_requests
CREATE INDEX idx_api_requests_profile_id ON api_requests(profile_id);
CREATE INDEX idx_api_requests_api_key_id ON api_requests(api_key_id);
CREATE INDEX idx_api_requests_api_id ON api_requests(api_id);
CREATE INDEX idx_api_requests_endpoint_id ON api_requests(endpoint_id);
CREATE INDEX idx_api_requests_request_id ON api_requests(request_id);
CREATE INDEX idx_api_requests_timestamp ON api_requests(created_at);
CREATE INDEX idx_api_requests_status_code ON api_requests(status_code);
CREATE INDEX idx_api_requests_ip_hash ON api_requests(ip_hash);

-- usage_records
CREATE INDEX idx_usage_records_profile_id ON usage_records(profile_id);
CREATE INDEX idx_usage_records_api_key_id ON usage_records(api_key_id);
CREATE INDEX idx_usage_records_api_id ON usage_records(api_id);
CREATE INDEX idx_usage_records_date ON usage_records(date);

-- subscriptions
CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(stripe_customer_id);

-- notifications
CREATE INDEX idx_notifications_profile_id ON notifications(profile_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ============================================================================
-- RLS (Row Level Security) POLICIES
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE apis ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_key_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- profiles: users can read their own profile; admins can read all
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles"
    ON profiles FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- projects: users can access their own projects
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = owner_id);

CREATE POLICY "Service role can manage projects"
    ON projects FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- apis: publicly readable, service role can manage
CREATE POLICY "Public can view apis"
    ON apis FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage apis"
    ON apis FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- api_providers: publicly readable, service role can manage
CREATE POLICY "Public can view providers"
    ON api_providers FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage providers"
    ON api_providers FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- api_endpoints: publicly readable, service role can manage
CREATE POLICY "Public can view endpoints"
    ON api_endpoints FOR SELECT
    USING (true);

CREATE POLICY "Service role can manage endpoints"
    ON api_endpoints FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- api_keys: users can only access keys from their own projects
CREATE POLICY "Users can view own project keys"
    ON api_keys FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = api_keys.project_id
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create own project keys"
    ON api_keys FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = project_id
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own project keys"
    ON api_keys FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = api_keys.project_id
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can revoke own project keys"
    ON api_keys FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM projects
            WHERE projects.id = api_keys.project_id
            AND projects.owner_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all keys"
    ON api_keys FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- api_key_permissions: same ownership as api_keys
CREATE POLICY "Users can manage own project key permissions"
    ON api_key_permissions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM api_keys ak
            JOIN projects p ON p.id = ak.project_id
            WHERE ak.id = api_key_permissions.api_key_id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all permissions"
    ON api_key_permissions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- api_requests: users can only see their own project's requests
CREATE POLICY "Users can view own project requests"
    ON api_requests FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM api_keys ak
            JOIN projects p ON p.id = ak.project_id
            WHERE ak.id = api_requests.api_key_id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all requests"
    ON api_requests FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- usage_records: users can only see their own project's usage
CREATE POLICY "Users can view own project usage"
    ON usage_records FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM api_keys ak
            JOIN projects p ON p.id = ak.project_id
            WHERE ak.id = usage_records.api_key_id
            AND p.owner_id = auth.uid()
        )
    );

CREATE POLICY "Service role can manage all usage"
    ON usage_records FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- subscriptions: users can only see their own subscription
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own subscription"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = profile_id);

CREATE POLICY "Service role can manage all subscriptions"
    ON subscriptions FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- notifications: users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Service role can manage all notifications"
    ON notifications FOR ALL
    USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_apis_updated_at
    BEFORE UPDATE ON apis
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_providers_updated_at
    BEFORE UPDATE ON api_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_endpoints_updated_at
    BEFORE UPDATE ON api_endpoints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_records_updated_at
    BEFORE UPDATE ON usage_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Generate a new API key (returns both the raw key and the hash)
CREATE OR REPLACE FUNCTION generate_api_key(
    p_prefix TEXT,
    p_raw_key TEXT
) RETURNS TABLE (raw_key TEXT, key_hash TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p_raw_key, crypt(p_raw_key, gen_salt('bf', 12));
END;
$$ LANGUAGE plpgsql;

-- Record a new API request
CREATE OR REPLACE FUNCTION record_api_request(
    p_request_id TEXT,
    p_profile_id UUID,
    p_api_key_id UUID,
    p_api_id UUID,
    p_endpoint_id UUID,
    p_method request_method,
    p_path TEXT,
    p_query_params TEXT,
    p_request_body TEXT,
    p_status_code INTEGER,
    p_latency_ms INTEGER,
    p_ip_hash TEXT,
    p_user_agent TEXT,
    p_error_message TEXT,
    p_response_size_bytes INTEGER
) RETURNS UUID AS $$
DECLARE
    v_request_id UUID;
BEGIN
    v_request_id := uuid_generate_v4();

    INSERT INTO api_requests (
        id, request_id, profile_id, api_key_id, api_id, endpoint_id,
        method, path, query_params, request_body, status_code,
        latency_ms, ip_hash, user_agent, error_message, response_size_bytes
    ) VALUES (
        v_request_id, p_request_id, p_profile_id, p_api_key_id, p_api_id, p_endpoint_id,
        p_method, p_path, p_query_params, p_request_body, p_status_code,
        p_latency_ms, p_ip_hash, p_user_agent, p_error_message, p_response_size_bytes
    );

    -- Update last_used_at on the api_key
    UPDATE api_keys SET last_used_at = now() WHERE id = p_api_key_id;

    RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aggregate usage for a day
CREATE OR REPLACE FUNCTION aggregate_daily_usage(
    p_profile_id UUID,
    p_api_key_id UUID,
    p_api_id UUID,
    p_date DATE
) RETURNS VOID AS $$
BEGIN
    INSERT INTO usage_records (
        profile_id, api_key_id, api_id, date,
        total_requests, successful_requests, failed_requests,
        total_latency_ms, bytes_sent
    )
    SELECT
        p_profile_id, p_api_key_id, p_api_id, p_date,
        COUNT(*)::INTEGER,
        COUNT(*) FILTER (WHERE status_code >= 200 AND status_code < 400)::INTEGER,
        COUNT(*) FILTER (WHERE status_code >= 400)::INTEGER,
        COALESCE(SUM(latency_ms), 0)::BIGINT,
        COALESCE(SUM(response_size_bytes), 0)::BIGINT
    FROM api_requests
    WHERE profile_id = p_profile_id
      AND api_key_id = p_api_key_id
      AND (p_api_id IS NULL OR api_id = p_api_id)
      AND created_at >= p_date
      AND created_at < p_date + INTERVAL '1 day'
    GROUP BY p_profile_id, p_api_key_id, p_api_id, p_date
    ON CONFLICT (profile_id, api_key_id, COALESCE(api_id, '00000000-0000-0000-0000-000000000000'::UUID), date)
    DO UPDATE SET
        total_requests = EXCLUDED.total_requests,
        successful_requests = EXCLUDED.successful_requests,
        failed_requests = EXCLUDED.failed_requests,
        total_latency_ms = EXCLUDED.total_latency_ms,
        bytes_sent = EXCLUDED.bytes_sent,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
