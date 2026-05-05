-- Keep demo terminal credentials predictable across roles.
-- Reuse the existing working server1 PIN hash from V7.
UPDATE users
SET pin_hash = '$2a$10$c2pdpEsvHQ5dAmtWf/IOceygloF9e3jk.PG2AaBsr92wAlDLhv4Le'
WHERE auth_method = 'PIN'
  AND role IN ('SERVER', 'CHEF', 'CASHIER', 'HOST', 'MANAGER');

-- Let admin password match the same demo credential used on the terminal.
UPDATE users
SET password_hash = '$2a$10$c2pdpEsvHQ5dAmtWf/IOceygloF9e3jk.PG2AaBsr92wAlDLhv4Le'
WHERE username = 'admin'
  AND auth_method = 'PASSWORD';
