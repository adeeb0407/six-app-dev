-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY,
    phone TEXT,
    name TEXT,
    keyword_summary TEXT[],
    profile_photos TEXT[],
    created_at TIMESTAMP
); 