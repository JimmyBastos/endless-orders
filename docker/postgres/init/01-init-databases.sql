-- Create additional databases if they don't exist
-- This script runs when the PostgreSQL container starts for the first time

-- Create test database
SELECT 'CREATE DATABASE endlessdb_test'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'endlessdb_test')\gexec

-- Grant privileges to the user
GRANT ALL PRIVILEGES ON DATABASE endlessdb TO user;
GRANT ALL PRIVILEGES ON DATABASE endlessdb_test TO user;
