-- Evil Teammate Stats: assassination outcomes when playing non-assassin evil roles

CREATE TABLE PlayerEvilTeammateStats (
    uid TEXT PRIMARY KEY NOT NULL,
    gamesPlayed INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    successfulAssassinations INTEGER NOT NULL,
    failedAssassinations INTEGER NOT NULL,
    FOREIGN KEY (uid) REFERENCES PlayerStats(uid) ON DELETE CASCADE
);

CREATE TABLE PersonEvilTeammateStats (
    personId TEXT PRIMARY KEY NOT NULL,
    gamesPlayed INTEGER NOT NULL,
    wins INTEGER NOT NULL,
    successfulAssassinations INTEGER NOT NULL,
    failedAssassinations INTEGER NOT NULL,
    FOREIGN KEY (personId) REFERENCES PersonStats(personId) ON DELETE CASCADE
);
