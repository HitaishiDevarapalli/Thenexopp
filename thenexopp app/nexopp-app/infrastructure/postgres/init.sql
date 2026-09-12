-- Initialize PostgreSQL extensions and database options
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE thenexopp_agent_db TO thenexopp_user;
