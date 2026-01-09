-- Migration 018: Fix password hashes for demo accounts
-- Issue: Password hashes were generated with escaped passwords (Demo123\! instead of Demo123!)
-- Generated: 2026-01-10

-- Update admin user password hash (password: Admin123!)
UPDATE users
SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$BraDp+lXG85xjJLLD0HdLg$QzCklVicPQ3wTCSroJRP67ZDTlczBPnk8AgvkP1iAnw',
    updated_at = NOW()
WHERE email = 'admin@stat-discute.be';

-- Update demo user password hash (password: Demo123!)
UPDATE users
SET password_hash = '$argon2id$v=19$m=65536,t=3,p=4$61g4HuGH2ZwHD2xP+/twqw$XtU2R1NdG6MqyWLoGseYjDtccrvJpmf2ofWv2fBO0C0',
    updated_at = NOW()
WHERE email = 'demo@stat-discute.be';

-- Verify the update
SELECT email,
       LEFT(password_hash, 50) || '...' as hash_preview,
       updated_at
FROM users
WHERE email IN ('admin@stat-discute.be', 'demo@stat-discute.be');
