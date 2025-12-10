-- PlayerStats table stores pre-computed player statistics for efficient retrieval
-- Stats are keyed by player UID (unmapped) or person ID (mapped)
CREATE TABLE PlayerStats (
    id TEXT PRIMARY KEY NOT NULL,
    playerId TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    isMapped INTEGER NOT NULL DEFAULT 0,
    gamesPlayed INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    goodGames INTEGER NOT NULL DEFAULT 0,
    goodWins INTEGER NOT NULL DEFAULT 0,
    evilGames INTEGER NOT NULL DEFAULT 0,
    evilWins INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

CREATE INDEX idx_player_stats_player_id ON PlayerStats(playerId);
CREATE INDEX idx_player_stats_games_played ON PlayerStats(gamesPlayed DESC);
