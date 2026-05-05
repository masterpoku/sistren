-- Session cleanup event for expired data
-- Runs daily at 1:00 AM to remove expired sessions, verifications, and old draft payments

SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS cleanup_expired_data
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP + INTERVAL 1 HOUR
DO
BEGIN
  -- Cleanup expired sessions
  DELETE FROM sessions WHERE expiresAt < NOW();

  -- Cleanup expired verification tokens
  DELETE FROM verifications WHERE expiresAt < NOW();

  -- Cleanup old draft payments (30+ days)
  DELETE FROM payments
  WHERE status = 'draft'
    AND created_at < NOW() - INTERVAL 30 DAY;
END;