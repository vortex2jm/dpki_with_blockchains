UPDATE Certificates
SET active = ?, updated_at = datetime('now')
WHERE public_key = ?;
