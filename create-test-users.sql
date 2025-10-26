USE cbl_ordres;

-- Default Admin User
INSERT INTO users (username, password_hash, full_name, role, is_active) 
VALUES ('m.islam@cg-bd.com', '#lme11@@', 'Mahmudul Islam', 'admin', TRUE);

-- Insert test users (passwords are plain text for testing)
-- TSO User (replace 'Your Territory Name' with actual territory from dealers table)
INSERT INTO users (username, password_hash, full_name, role, territory_name, is_active) 
VALUES ('tso001', 'tso123', 'Test TSO', 'tso', 'Your Territory Name', TRUE);

-- Sales Manager User
INSERT INTO users (username, password_hash, full_name, role, is_active) 
VALUES ('sales001', 'sales123', 'Test Sales Manager', 'sales_manager', TRUE);
