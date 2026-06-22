// Мапінг метрик FotMob → поля PlayerSeasonStats.
// КЛЮЧ = "<group>::<localizedTitleId>" — бо один titleId (fouls) має різний
// зміст у різних групах (possession=fouls won, defending=fouls committed).
// group: "top" (topStatCard), "shooting", "passing", "possession",
//        "defending", "discipline", "goalkeeping".
// Усі titleId звірені з реальним ingest.

export interface MetricMapEntry {
  key: string; // "<group>::<titleId>"
  base: string;
  isFloat: boolean;
  hasPer90: boolean;
  hasPct: boolean;
}

export const METRIC_MAP: MetricMapEntry[] = [
  // ── MAIN LEAGUE STATS (базові, надійні, є для ВСІХ включно з GK) ──
  { key: "ml::minutes_played", base: "minutes", isFloat: false, hasPer90: false, hasPct: false },
  { key: "ml::matches_uppercase", base: "matches", isFloat: false, hasPer90: false, hasPct: false },
  { key: "ml::rating", base: "rating", isFloat: true, hasPer90: false, hasPct: false },
  { key: "ml::yellow_cards", base: "yellowCards", isFloat: false, hasPer90: false, hasPct: false },
  { key: "ml::red_cards", base: "redCards", isFloat: false, hasPer90: false, hasPct: false },
  { key: "ml::clean_sheet_title", base: "cleanSheets", isFloat: false, hasPer90: false, hasPct: false },
  { key: "ml::goals_conceded", base: "goalsConceded", isFloat: false, hasPer90: false, hasPct: false },
  { key: "ml::saved_penalties", base: "penaltySaves", isFloat: false, hasPer90: false, hasPct: false },

  // ── TOP STAT CARD (загальні) ──
  { key: "top::rating", base: "rating", isFloat: true, hasPer90: false, hasPct: false },
  { key: "top::matches_uppercase", base: "matches", isFloat: false, hasPer90: false, hasPct: false },
  { key: "top::player_started_matches", base: "started", isFloat: false, hasPer90: false, hasPct: false },
  { key: "top::minutes_played", base: "minutes", isFloat: false, hasPer90: false, hasPct: false },
  // top-дублі: значення є і в statsSection (shooting/passing/goalkeeping),
  // звідки беруться фінально. Мапимо й тут лише щоб не засмічувати unknownTitleIds.
  { key: "top::goals", base: "goals", isFloat: false, hasPer90: true, hasPct: true },
  { key: "top::assists", base: "assists", isFloat: false, hasPer90: true, hasPct: true },
  { key: "top::goals_conceded", base: "goalsConceded", isFloat: false, hasPer90: true, hasPct: true },
  { key: "top::clean_sheet_title", base: "cleanSheetsGk", isFloat: false, hasPer90: false, hasPct: false },
  { key: "top::saved_penalties", base: "penaltySaves", isFloat: false, hasPer90: false, hasPct: false },
  // (goals/assists у topStatCard теж є, але їх беремо з shooting/passing нижче)

  // ── SHOOTING ──
  { key: "shooting::goals", base: "goals", isFloat: false, hasPer90: true, hasPct: true },
  { key: "shooting::expected_goals", base: "xg", isFloat: true, hasPer90: true, hasPct: true },
  { key: "shooting::expected_goals_on_target", base: "xgot", isFloat: true, hasPer90: true, hasPct: true },
  { key: "shooting::goals_subtitle", base: "penaltyGoals", isFloat: false, hasPer90: true, hasPct: true },
  { key: "shooting::non_penalty_xg", base: "npxg", isFloat: true, hasPer90: true, hasPct: true },
  { key: "shooting::shots", base: "shots", isFloat: false, hasPer90: true, hasPct: true },
  { key: "shooting::ShotsOnTarget", base: "shotsOnTarget", isFloat: false, hasPer90: true, hasPct: true },
  { key: "shooting::headed_shots", base: "headedShots", isFloat: false, hasPer90: true, hasPct: true },

  // ── PASSING ──
  { key: "passing::assists", base: "assists", isFloat: false, hasPer90: true, hasPct: true },
  { key: "passing::expected_assists", base: "xa", isFloat: true, hasPer90: true, hasPct: true },
  { key: "passing::successful_passes", base: "successfulPasses", isFloat: false, hasPer90: true, hasPct: true },
  { key: "passing::successful_passes_accuracy", base: "passAccuracy", isFloat: true, hasPer90: false, hasPct: true },
  { key: "passing::long_balls_accurate", base: "accurateLongBalls", isFloat: false, hasPer90: true, hasPct: true },
  { key: "passing::long_ball_succeeeded_accuracy", base: "longBallAccuracy", isFloat: true, hasPer90: false, hasPct: true },
  { key: "passing::chances_created", base: "chancesCreated", isFloat: false, hasPer90: true, hasPct: true },
  { key: "passing::big_chance_created_team_title", base: "bigChancesCreated", isFloat: false, hasPer90: true, hasPct: true },
  { key: "passing::crosses_succeeeded", base: "successfulCrosses", isFloat: false, hasPer90: true, hasPct: true },
  { key: "passing::crosses_succeeeded_accuracy", base: "crossAccuracy", isFloat: true, hasPer90: false, hasPct: true },

  // ── POSSESSION ──
  { key: "possession::dribbles_succeeded", base: "successfulDribbles", isFloat: false, hasPer90: true, hasPct: true },
  { key: "possession::won_contest_subtitle", base: "dribbleSuccessRate", isFloat: true, hasPer90: false, hasPct: true },
  { key: "possession::duel_won", base: "duelsWon", isFloat: false, hasPer90: true, hasPct: true },
  { key: "possession::duel_won_percent", base: "duelsWonPctValue", isFloat: true, hasPer90: false, hasPct: true },
  { key: "possession::aerials_won", base: "aerialDuelsWon", isFloat: false, hasPer90: true, hasPct: true },
  { key: "possession::aerials_won_percent", base: "aerialDuelsWonPctValue", isFloat: true, hasPer90: false, hasPct: true },
  { key: "possession::touches", base: "touches", isFloat: false, hasPer90: true, hasPct: true },
  { key: "possession::touches_opp_box", base: "touchesOppBox", isFloat: false, hasPer90: true, hasPct: true },
  { key: "possession::dispossessed", base: "dispossessed", isFloat: false, hasPer90: true, hasPct: true },
  { key: "possession::fouls_won", base: "foulsWon", isFloat: false, hasPer90: true, hasPct: true },
  { key: "possession::penalty_won_title", base: "penaltiesAwarded", isFloat: false, hasPer90: false, hasPct: false },

  // ── DEFENDING ──
  { key: "defending::defensive_actions", base: "defensiveContributions", isFloat: false, hasPer90: true, hasPct: true },
  { key: "defending::matchstats.headers.tackles", base: "tackles", isFloat: false, hasPer90: true, hasPct: true },
  { key: "defending::fouls", base: "foulsCommitted", isFloat: false, hasPer90: true, hasPct: true },
  { key: "defending::recoveries", base: "recoveries", isFloat: false, hasPer90: true, hasPct: true },
  { key: "defending::poss_won_att_3rd_team_title", base: "possessionWonFinalThird", isFloat: false, hasPer90: true, hasPct: true },
  { key: "defending::dribbled_past", base: "dribbledPast", isFloat: false, hasPer90: true, hasPct: true },
  { key: "defending::clearances", base: "clearances", isFloat: false, hasPer90: true, hasPct: true },
  { key: "defending::clean_sheet_team_title", base: "cleanSheets", isFloat: false, hasPer90: false, hasPct: true },
  { key: "defending::goals_conceded_while_on_pitch", base: "goalsConcededOnPitch", isFloat: false, hasPer90: false, hasPct: false },
  { key: "defending::expected_goals_against_while_on_pitch", base: "xgConcededOnPitch", isFloat: true, hasPer90: false, hasPct: false },
  { key: "defending::penalty_conceded_title", base: "penaltiesConceded", isFloat: false, hasPer90: false, hasPct: false },
  // інколи interceptions/blocked_shots у defending — додаємо й їх
  { key: "defending::interceptions", base: "interceptions", isFloat: false, hasPer90: true, hasPct: true },
  { key: "defending::blocked_shots", base: "blockedShots", isFloat: false, hasPer90: true, hasPct: true },

  // ── GOALKEEPING (група "goalkeeping") ──
  { key: "goalkeeping::saves", base: "saves", isFloat: false, hasPer90: true, hasPct: true },
  { key: "goalkeeping::save_percentage", base: "savePercentage", isFloat: true, hasPer90: false, hasPct: true },
  { key: "goalkeeping::goals_conceded", base: "goalsConceded", isFloat: false, hasPer90: true, hasPct: true },
  { key: "goalkeeping::goals_prevented", base: "goalsPrevented", isFloat: true, hasPer90: false, hasPct: true },
  { key: "goalkeeping::penalty_saves", base: "penaltySaves", isFloat: false, hasPer90: false, hasPct: false },
  { key: "goalkeeping::clean_sheet_team_title", base: "cleanSheetsGk", isFloat: false, hasPer90: false, hasPct: true },
  // розширені воротарські метрики
  { key: "goalkeeping::keeper_sweeper", base: "keeperSweeper", isFloat: false, hasPer90: true, hasPct: true },
  { key: "goalkeeping::keeper_high_claim", base: "keeperHighClaim", isFloat: false, hasPer90: true, hasPct: true },
  { key: "goalkeeping::error_led_to_goal", base: "errorLedToGoal", isFloat: false, hasPer90: true, hasPct: true },
  { key: "goalkeeping::penalty_goals_conceded", base: "penaltyGoalsConceded", isFloat: false, hasPer90: false, hasPct: false },
  { key: "goalkeeping::penalty_save_percent", base: "penaltySavePercentage", isFloat: true, hasPer90: false, hasPct: true },

  // ── DISTRIBUTION (воротарські паси — окрема група в GK) ──
  { key: "distribution::successful_passes", base: "successfulPasses", isFloat: false, hasPer90: true, hasPct: true },
  { key: "distribution::successful_passes_accuracy", base: "passAccuracy", isFloat: true, hasPer90: false, hasPct: true },
  { key: "distribution::long_balls_accurate", base: "accurateLongBalls", isFloat: false, hasPer90: true, hasPct: true },
  { key: "distribution::long_ball_succeeeded_accuracy", base: "longBallAccuracy", isFloat: true, hasPer90: false, hasPct: true },
  { key: "distribution::assists", base: "assists", isFloat: false, hasPer90: true, hasPct: true },
  { key: "distribution::expected_assists", base: "xa", isFloat: true, hasPer90: true, hasPct: true },
  { key: "distribution::chances_created", base: "chancesCreated", isFloat: false, hasPer90: true, hasPct: true },

  // ── DISCIPLINE ──
  { key: "discipline::yellow_cards", base: "yellowCards", isFloat: false, hasPer90: false, hasPct: false },
  { key: "discipline::red_cards", base: "redCards", isFloat: false, hasPer90: false, hasPct: false },
];

export const METRIC_BY_KEY = new Map(METRIC_MAP.map((m) => [m.key, m]));

// ВАЖЛИВО: назва групи goalkeeping може бути "goalkeeper" — звіримо на ingest.
// Невпізнані ключі логуються як "<group>::<titleId>" — видно і групу, і метрику.
