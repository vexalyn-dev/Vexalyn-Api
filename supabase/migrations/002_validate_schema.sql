-- VEXALYN API — Supabase Database Validation Script
-- Run this after migrations to verify schema integrity

-- ============================================================================
-- 1. VERIFY TABLES EXIST
-- ============================================================================

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ============================================================================
-- 2. VERIFY FOREIGN KEYS
-- ============================================================================

SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.ordinal_position;

-- ============================================================================
-- 3. VERIFY INDEXES
-- ============================================================================

SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================================
-- 4. VERIFY RLS STATUS
-- ============================================================================

SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- 5. VERIFY POLICIES
-- ============================================================================

SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================================================
-- 6. VERIFY FUNCTIONS
-- ============================================================================

SELECT
    schemaname,
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- ============================================================================
-- 7. VERIFY ENUMS
-- ============================================================================

SELECT
    t.typname AS enum_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
WHERE t.typname IN (
    'api_status', 'key_status', 'key_environment',
    'request_method', 'subscription_tier',
    'notification_type', 'notification_status'
)
ORDER BY t.typname, e.enumsortorder;
