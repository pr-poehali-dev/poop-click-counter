CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    name VARCHAR(30) NOT NULL UNIQUE,
    total_clicks BIGINT NOT NULL DEFAULT 0,
    multiplier INTEGER NOT NULL DEFAULT 1,
    achievements_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_total_clicks ON leaderboard(total_clicks DESC);
