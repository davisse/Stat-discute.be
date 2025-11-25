-- NBA Bettor Agent Episodic Memory Schema
-- SQLite database for tracking predictions and learning

-- Core wager tracking
CREATE TABLE IF NOT EXISTS wagers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    game_id TEXT NOT NULL,
    bet_type TEXT NOT NULL CHECK (bet_type IN ('SPREAD', 'TOTAL', 'PLAYER_PROP', 'MONEYLINE')),
    selection TEXT NOT NULL,
    line REAL NOT NULL,
    confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    predicted_edge REAL NOT NULL,
    reasoning_trace TEXT,  -- JSON blob with full debate transcript
    bull_arguments TEXT,   -- JSON array
    bear_arguments TEXT,   -- JSON array

    -- Outcome tracking (filled by post-mortem)
    outcome TEXT CHECK (outcome IN ('WIN', 'LOSS', 'PUSH', NULL)),
    actual_margin REAL,
    profit REAL,

    -- Metadata
    depth TEXT DEFAULT 'standard' CHECK (depth IN ('quick', 'standard', 'deep')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    settled_at TIMESTAMP
);

-- Calibration tracking by confidence bucket
CREATE TABLE IF NOT EXISTS calibration_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    confidence_bucket INTEGER NOT NULL CHECK (confidence_bucket IN (40, 50, 60, 70, 80)),
    total_bets INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    pushes INTEGER NOT NULL DEFAULT 0,
    actual_win_rate REAL,
    calibration_error REAL,  -- |expected - actual|
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning rules extracted from post-mortem analysis
CREATE TABLE IF NOT EXISTS learning_rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    condition TEXT NOT NULL,  -- SQL-like condition or natural language
    condition_type TEXT DEFAULT 'natural' CHECK (condition_type IN ('sql', 'natural')),
    adjustment REAL NOT NULL,  -- e.g., -0.05 = reduce confidence by 5%
    evidence TEXT,  -- Why this rule was created
    trigger_count INTEGER DEFAULT 0,  -- How many times this rule has been applied
    win_rate_before REAL,  -- Win rate before rule was created
    win_rate_after REAL,   -- Win rate after applying rule
    sample_size INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_applied_at TIMESTAMP
);

-- Similar bet retrieval cache
CREATE TABLE IF NOT EXISTS bet_embeddings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wager_id INTEGER REFERENCES wagers(id),
    embedding BLOB,  -- Vector embedding for similarity search
    context_hash TEXT,  -- Hash of game context for quick lookup
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Root cause analysis for high-confidence losses
CREATE TABLE IF NOT EXISTS loss_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    wager_id INTEGER REFERENCES wagers(id),
    root_cause TEXT NOT NULL,
    category TEXT CHECK (category IN (
        'INJURY_MISS', 'B2B_FACTOR', 'ALTITUDE', 'REFEREE',
        'LINE_MOVEMENT', 'PUBLIC_TRAP', 'BAD_BEAT', 'MODEL_ERROR', 'OTHER'
    )),
    severity TEXT CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    action_taken TEXT,  -- What learning rule was created
    learning_rule_id INTEGER REFERENCES learning_rules(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily performance summary
CREATE TABLE IF NOT EXISTS daily_summary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL UNIQUE,  -- YYYY-MM-DD
    total_bets INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    pushes INTEGER DEFAULT 0,
    total_profit REAL DEFAULT 0,
    avg_confidence REAL,
    avg_edge REAL,
    reflexion_loops INTEGER DEFAULT 0,  -- Total retry cycles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_wagers_game ON wagers(game_id);
CREATE INDEX IF NOT EXISTS idx_wagers_outcome ON wagers(outcome);
CREATE INDEX IF NOT EXISTS idx_wagers_confidence ON wagers(confidence);
CREATE INDEX IF NOT EXISTS idx_wagers_created ON wagers(created_at);
CREATE INDEX IF NOT EXISTS idx_wagers_bet_type ON wagers(bet_type);
CREATE INDEX IF NOT EXISTS idx_learning_rules_active ON learning_rules(active);
CREATE INDEX IF NOT EXISTS idx_loss_analysis_category ON loss_analysis(category);
CREATE INDEX IF NOT EXISTS idx_daily_summary_date ON daily_summary(date);

-- Initialize calibration buckets
INSERT OR IGNORE INTO calibration_log (confidence_bucket, total_bets, wins, losses, pushes)
VALUES
    (40, 0, 0, 0, 0),
    (50, 0, 0, 0, 0),
    (60, 0, 0, 0, 0),
    (70, 0, 0, 0, 0),
    (80, 0, 0, 0, 0);

-- Default learning rules (can be expanded)
INSERT OR IGNORE INTO learning_rules (condition, condition_type, adjustment, evidence, active)
VALUES
    ('team_on_b2b AND opponent_rested', 'natural', -0.05, 'Back-to-back teams historically underperform vs rested opponents', TRUE),
    ('altitude > 5000 AND visitor', 'natural', -0.03, 'Altitude disadvantage in Denver', TRUE),
    ('public_pct > 0.75 AND line_moved_against', 'natural', -0.08, 'Reverse line movement indicates sharp money against', TRUE);
