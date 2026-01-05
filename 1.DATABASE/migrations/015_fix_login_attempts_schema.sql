-- ============================================
-- Migration 015: Fix login_attempts Schema
-- ============================================
-- Description: Aligns login_attempts table with frontend rate-limit.ts expectations
--              The original schema used identifier/identifier_type/attempted_at
--              but the frontend code expects email/attempt_time columns
--
-- Author: Claude Code
-- Date: 2025-01-06
-- Dependencies: 008_authentication_system.sql
--
-- Issue: Login failures due to "column email does not exist" error
-- Root Cause: Schema mismatch between database and frontend code
--
-- Changes:
--   - Add email column (for direct email-based rate limiting)
--   - Add attempt_time column (alias for frontend compatibility)
--   - Make identifier/identifier_type nullable (for backwards compatibility)
--   - Drop strict constraint on failure_reason (allow null for success=false)
--
-- Usage:
--   psql statdiscute < migrations/015_fix_login_attempts_schema.sql
-- ============================================

-- ============================================
-- 1. ADD NEW COLUMNS
-- ============================================

-- Add email column for direct email-based queries
ALTER TABLE login_attempts
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add attempt_time column (frontend uses this instead of attempted_at)
ALTER TABLE login_attempts
ADD COLUMN IF NOT EXISTS attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Populate attempt_time from existing attempted_at data
UPDATE login_attempts
SET attempt_time = attempted_at
WHERE attempt_time IS NULL AND attempted_at IS NOT NULL;

-- Populate email from identifier where identifier_type = 'email'
UPDATE login_attempts
SET email = identifier
WHERE email IS NULL AND identifier_type = 'email';

COMMENT ON COLUMN login_attempts.email IS 'Direct email column for rate limiting queries (added for frontend compatibility)';
COMMENT ON COLUMN login_attempts.attempt_time IS 'Timestamp alias for frontend compatibility (mirrors attempted_at)';

-- ============================================
-- 2. MAKE LEGACY COLUMNS NULLABLE
-- ============================================

-- Make identifier nullable (new inserts may only use email)
ALTER TABLE login_attempts
ALTER COLUMN identifier DROP NOT NULL;

-- Make identifier_type nullable (new inserts may only use email)
ALTER TABLE login_attempts
ALTER COLUMN identifier_type DROP NOT NULL;

-- ============================================
-- 3. DROP/MODIFY CONSTRAINTS
-- ============================================

-- Drop the strict failure_reason constraint
-- The frontend code may not always provide failure_reason
ALTER TABLE login_attempts
DROP CONSTRAINT IF EXISTS login_attempts_failure_has_reason;

-- Drop identifier_type check constraint if it exists
ALTER TABLE login_attempts
DROP CONSTRAINT IF EXISTS login_attempts_identifier_type_check;

-- ============================================
-- 4. ADD INDEXES FOR NEW COLUMNS
-- ============================================

-- Index for email-based rate limiting queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_email
ON login_attempts(email);

-- Index for attempt_time based queries
CREATE INDEX IF NOT EXISTS idx_login_attempts_attempt_time
ON login_attempts(attempt_time);

-- Composite index for email + time window rate limiting
CREATE INDEX IF NOT EXISTS idx_login_attempts_email_rate_limit
ON login_attempts(email, attempt_time)
WHERE success = false;

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Verify new columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'login_attempts'
  AND column_name IN ('email', 'attempt_time', 'identifier', 'identifier_type')
ORDER BY column_name;

-- Verify constraints
SELECT
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint
WHERE conrelid = 'login_attempts'::regclass;

-- Verify indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'login_attempts'
ORDER BY indexname;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Migration 015: Fix login_attempts Schema - COMPLETE';
  RAISE NOTICE '================================================';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '  - Added email column for direct email queries';
  RAISE NOTICE '  - Added attempt_time column (frontend compatibility)';
  RAISE NOTICE '  - Made identifier/identifier_type nullable';
  RAISE NOTICE '  - Dropped strict failure_reason constraint';
  RAISE NOTICE '  - Added indexes for new columns';
  RAISE NOTICE '';
  RAISE NOTICE 'Frontend rate-limit.ts now compatible with database schema';
  RAISE NOTICE '================================================';
END $$;
