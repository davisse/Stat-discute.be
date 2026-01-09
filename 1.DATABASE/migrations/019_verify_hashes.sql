-- Migration 019: Verify password hashes (read-only)
-- Just checks the current state of password hashes

SELECT email,
       password_hash,
       LENGTH(password_hash) as hash_length,
       updated_at
FROM users
WHERE email IN ('admin@stat-discute.be', 'demo@stat-discute.be');
