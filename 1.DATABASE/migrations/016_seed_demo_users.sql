-- ============================================
-- Migration 016: Seed Demo Users
-- ============================================
-- Description: Ensures demo user accounts exist for testing and demos.
--              Uses ON CONFLICT to preserve existing users if they already exist.
--
--              IMPORTANT: This migration should be included in every deployment
--              to ensure demo credentials are never lost.
--
-- Demo Accounts:
--   - admin@stat-discute.be (password: Admin123!)
--   - demo@stat-discute.be (password: Demo123!)
--
-- Author: Claude Code
-- Date: 2025-01-06
-- Dependencies: 008_authentication_system.sql
--
-- Usage:
--   psql nba_stats < migrations/016_seed_demo_users.sql
-- ============================================

-- Insert demo users with ON CONFLICT DO NOTHING to preserve existing accounts
-- This ensures:
--   1. Users are created if they don't exist
--   2. Existing users (and their changed passwords) are NOT overwritten
--   3. Safe to run multiple times (idempotent)

INSERT INTO users (email, password_hash, full_name, role, email_verified, is_active)
VALUES (
    'admin@stat-discute.be',
    '$argon2id$v=19$m=65536,t=3,p=4$g22ymYlAzMDTm/11+rPVAA$qarhtDM+AyhCH8yB9NY0oWjFa3KOWnTplNhrUEJXVaI',
    'Administrator',
    'admin',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

INSERT INTO users (email, password_hash, full_name, role, email_verified, is_active)
VALUES (
    'demo@stat-discute.be',
    '$argon2id$v=19$m=65536,t=3,p=4$kolJgUCidiT1p+PvWvLnOQ$RZ5wLFlFfi2BNimMCYUDodkUSp6J+2T1Jih2qHlg2Gk',
    'Demo User',
    'user',
    true,
    true
)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- VERIFICATION
-- ============================================

-- Verify demo users exist
DO $$
DECLARE
    admin_exists BOOLEAN;
    demo_exists BOOLEAN;
BEGIN
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@stat-discute.be') INTO admin_exists;
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'demo@stat-discute.be') INTO demo_exists;

    IF admin_exists AND demo_exists THEN
        RAISE NOTICE '================================================';
        RAISE NOTICE 'Migration 016: Seed Demo Users - COMPLETE';
        RAISE NOTICE '================================================';
        RAISE NOTICE 'Demo accounts verified:';
        RAISE NOTICE '  - admin@stat-discute.be (Admin123!)';
        RAISE NOTICE '  - demo@stat-discute.be (Demo123!)';
        RAISE NOTICE '================================================';
    ELSE
        RAISE WARNING 'Demo users may not have been created properly!';
        RAISE WARNING '  admin@stat-discute.be exists: %', admin_exists;
        RAISE WARNING '  demo@stat-discute.be exists: %', demo_exists;
    END IF;
END $$;

-- Show current demo users
SELECT
    user_id,
    email,
    full_name,
    role,
    email_verified,
    is_active,
    created_at
FROM users
WHERE email IN ('admin@stat-discute.be', 'demo@stat-discute.be')
ORDER BY email;
