-- Create users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    pin_hash VARCHAR(255),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    auth_method VARCHAR(20) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_username ON users (username);

CREATE INDEX idx_users_role ON users (role);

CREATE INDEX idx_users_auth_method ON users (auth_method);

CREATE INDEX idx_users_is_active ON users (is_active);