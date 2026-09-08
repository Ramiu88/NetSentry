-- Track which user triggered a manual scan and which user acknowledged an alert.
-- Both are nullable: scheduled scans and not-yet-acknowledged alerts have no user.

ALTER TABLE scans ADD COLUMN IF NOT EXISTS triggered_by_user_id INTEGER REFERENCES users(id);
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS acknowledged_by_user_id INTEGER REFERENCES users(id);
