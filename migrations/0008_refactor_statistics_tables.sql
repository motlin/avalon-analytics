-- Drop existing PlayerStats table (will be recreated with new structure)
DROP TABLE IF EXISTS PlayerStats;

-- PlayerStats: base statistics for a single UID
CREATE TABLE PlayerStats (
    uid TEXT PRIMARY KEY NOT NULL,
    name TEXT NOT NULL,
    isMapped INTEGER NOT NULL,
    gamesPlayed INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    goodGames INTEGER NOT NULL,
    goodWins INTEGER NOT NULL,
    evilGames INTEGER NOT NULL,
    evilWins INTEGER NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

CREATE INDEX idx_player_stats_games_played ON PlayerStats(gamesPlayed DESC);

-- PlayerRoleStats: per-role statistics for each player
CREATE TABLE PlayerRoleStats (
    uid TEXT NOT NULL,
    role TEXT NOT NULL,
    games INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    threeMissionFails INTEGER NOT NULL,
    threeMissionSuccesses INTEGER NOT NULL,
    fiveRejectedProposals INTEGER NOT NULL,
    merlinAssassinated INTEGER NOT NULL,
    wasAssassinated INTEGER NOT NULL,
    PRIMARY KEY (uid, role),
    FOREIGN KEY (uid) REFERENCES PlayerStats(uid) ON DELETE CASCADE
);

-- PlayerYearlyStats: year-by-year breakdown for each player
CREATE TABLE PlayerYearlyStats (
    uid TEXT NOT NULL,
    year INTEGER NOT NULL,
    games INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    goodGames INTEGER NOT NULL,
    goodWins INTEGER NOT NULL,
    evilGames INTEGER NOT NULL,
    evilWins INTEGER NOT NULL,
    PRIMARY KEY (uid, year),
    FOREIGN KEY (uid) REFERENCES PlayerStats(uid) ON DELETE CASCADE
);

-- PlayerLossReasons: loss breakdown for each player
CREATE TABLE PlayerLossReasons (
    uid TEXT PRIMARY KEY NOT NULL,
    threeMissionFails INTEGER NOT NULL,
    threeMissionSuccessEvil INTEGER NOT NULL,
    fiveRejectedProposals INTEGER NOT NULL,
    merlinAssassinated INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES PlayerStats(uid) ON DELETE CASCADE
);

-- PlayerMerlinStats: Merlin-specific stats for each player
CREATE TABLE PlayerMerlinStats (
    uid TEXT PRIMARY KEY NOT NULL,
    gamesPlayed INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    timesAssassinated INTEGER NOT NULL,
    survivedAssassination INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES PlayerStats(uid) ON DELETE CASCADE
);

-- PlayerAssassinStats: Assassin-specific stats for each player
CREATE TABLE PlayerAssassinStats (
    uid TEXT PRIMARY KEY NOT NULL,
    gamesPlayed INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    successfulAssassinations INTEGER NOT NULL,
    failedAssassinations INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES PlayerStats(uid) ON DELETE CASCADE
);

-- PersonStats: aggregated statistics for a person (across all their UIDs)
CREATE TABLE PersonStats (
    personId TEXT PRIMARY KEY NOT NULL,
    gamesPlayed INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    goodGames INTEGER NOT NULL,
    goodWins INTEGER NOT NULL,
    evilGames INTEGER NOT NULL,
    evilWins INTEGER NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    FOREIGN KEY (personId) REFERENCES Person(id) ON DELETE CASCADE
);

CREATE INDEX idx_person_stats_games_played ON PersonStats(gamesPlayed DESC);

-- PersonRoleStats: per-role statistics for each person
CREATE TABLE PersonRoleStats (
    personId TEXT NOT NULL,
    role TEXT NOT NULL,
    games INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    threeMissionFails INTEGER NOT NULL,
    threeMissionSuccesses INTEGER NOT NULL,
    fiveRejectedProposals INTEGER NOT NULL,
    merlinAssassinated INTEGER NOT NULL,
    wasAssassinated INTEGER NOT NULL,
    PRIMARY KEY (personId, role),
    FOREIGN KEY (personId) REFERENCES PersonStats(personId) ON DELETE CASCADE
);

-- PersonYearlyStats: year-by-year breakdown for each person
CREATE TABLE PersonYearlyStats (
    personId TEXT NOT NULL,
    year INTEGER NOT NULL,
    games INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    goodGames INTEGER NOT NULL,
    goodWins INTEGER NOT NULL,
    evilGames INTEGER NOT NULL,
    evilWins INTEGER NOT NULL,
    PRIMARY KEY (personId, year),
    FOREIGN KEY (personId) REFERENCES PersonStats(personId) ON DELETE CASCADE
);

-- PersonLossReasons: loss breakdown for each person
CREATE TABLE PersonLossReasons (
    personId TEXT PRIMARY KEY NOT NULL,
    threeMissionFails INTEGER NOT NULL,
    threeMissionSuccessEvil INTEGER NOT NULL,
    fiveRejectedProposals INTEGER NOT NULL,
    merlinAssassinated INTEGER NOT NULL,
    FOREIGN KEY (personId) REFERENCES PersonStats(personId) ON DELETE CASCADE
);

-- PersonMerlinStats: Merlin-specific stats for each person
CREATE TABLE PersonMerlinStats (
    personId TEXT PRIMARY KEY NOT NULL,
    gamesPlayed INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    timesAssassinated INTEGER NOT NULL,
    survivedAssassination INTEGER NOT NULL,
    FOREIGN KEY (personId) REFERENCES PersonStats(personId) ON DELETE CASCADE
);

-- PersonAssassinStats: Assassin-specific stats for each person
CREATE TABLE PersonAssassinStats (
    personId TEXT PRIMARY KEY NOT NULL,
    gamesPlayed INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    successfulAssassinations INTEGER NOT NULL,
    failedAssassinations INTEGER NOT NULL,
    FOREIGN KEY (personId) REFERENCES PersonStats(personId) ON DELETE CASCADE
);
