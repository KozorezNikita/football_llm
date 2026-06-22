"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Radar } from "./Radar";
import { PositionPitch } from "./PositionPitch";
import { ScoutNote } from "./ScoutNote";
import { TournamentSwitcher } from "./TournamentSwitcher";
import { StrengthHighlights } from "./StrengthHighlights";
import { PercentileBar } from "@/components/ui/PercentileBar";
import { GlassCard } from "@/components/ui/GlassCard";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { buildRadar } from "@/lib/data/radar";
import { groupLabel } from "@/lib/data/percentile";
import type { AnalyzedPlayer, PlayerProfile, PlayerTournament } from "@/lib/data/types";

// Групуємо метрики за категоріями для барів.
const CATEGORIES: { name: string; keys: string[] }[] = [
  { name: "Атака", keys: ["goals", "xg", "npxg", "xgot", "shots", "shotsOnTarget", "headedShots"] },
  { name: "Пас", keys: ["assists", "xa", "successfulPasses", "passAccuracy", "accurateLongBalls", "longBallAccuracy", "chancesCreated", "bigChancesCreated", "successfulCrosses", "crossAccuracy"] },
  { name: "Володіння", keys: ["successfulDribbles", "dribbleSuccessRate", "duelsWon", "duelsWonPctValue", "aerialDuelsWon", "aerialDuelsWonPctValue", "touches", "touchesOppBox", "dispossessed", "foulsWon"] },
  { name: "Оборона", keys: ["tackles", "interceptions", "blockedShots", "recoveries", "clearances", "possessionWonFinalThird", "defensiveContributions", "dribbledPast", "foulsCommitted", "goalsConcededOnPitch", "xgConcededOnPitch", "cleanSheets"] },
  { name: "Воротар", keys: ["saves", "savePercentage", "goalsPrevented", "goalsConceded", "cleanSheetsGk", "keeperSweeper", "keeperHighClaim", "errorLedToGoal", "penaltySavePercentage", "penaltySaves"] },
  { name: "Дисципліна", keys: ["yellowCards", "redCards"] },
];

export function PlayerCard({
  player, scoutNote, tournaments, activeTournamentId, playerId,
}: {
  player: AnalyzedPlayer;
  scoutNote: string;
  tournaments: PlayerTournament[];
  activeTournamentId: number;
  playerId: number;
}) {
  const router = useRouter();
  const { axes, ghost } = buildRadar(player);

  const handleTournament = (tid: number) => {
    router.push(`/players/${playerId}?t=${tid}`, { scroll: false });
  };

  const categories = CATEGORIES
    .map((cat) => ({
      name: cat.name,
      metrics: cat.keys
        .map((k) => player.metrics.find((m) => m.key === k))
        .filter((m): m is NonNullable<typeof m> => m != null),
    }))
    .filter((cat) => cat.metrics.length > 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ── Шапка + поле позицій ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "stretch" }}>
      <div className="noise edge-light" style={{
        position: "relative",
        background: "var(--surface-strong)",
        border: "1px solid var(--glass-border)",
        backdropFilter: "blur(var(--blur))",
        WebkitBackdropFilter: "blur(var(--blur))",
        borderRadius: "var(--r-xl)",
        padding: "0 24px 24px",
        marginTop: 40,
      }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 20 }}>
          {/* фото, що виступає за верх. БЕЗ Framer-анімації — щоб морфінг
              (View Transition) приземляв його чисто, без конфлікту. */}
          <div
            style={{ width: 130, height: 150, marginTop: -40, flexShrink: 0, position: "relative" }}
          >
            {player.photo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={player.photo} alt={player.name}
                style={{
                  width: "100%", height: "100%", objectFit: "contain",
                  objectPosition: "bottom center",
                  viewTransitionName: `player-photo-${player.playerId}`,
                }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
          </div>

          <div style={{ flex: 1, paddingBottom: 4, minWidth: 0 }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 18 }}
            >
              <h1 className="display" style={{ fontSize: 38, margin: 0, color: "var(--text-1)", textTransform: "uppercase" }}>
                {player.name}
              </h1>
              <span className="stat-num" style={{ fontSize: 16, color: "var(--text-3)" }}>#{player.shirtNumber}</span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ fontSize: 14, color: "var(--text-2)", margin: "6px 0 0" }}
            >
              {groupLabel(player.group)} · {player.primaryPosition} · {player.age} р.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: "center", flexShrink: 0, paddingBottom: 4 }}
          >
            <p className="eyebrow" style={{ margin: 0 }}>Рейтинг</p>
            <AnimatedNumber
              value={player.rating ?? 0}
              decimals={2}
              className="stat-num"
              style={{ fontSize: 30, fontWeight: 700, display: "block", marginTop: 2, color: "#0f6e56" }}
            />
          </motion.div>
        </div>

        {/* швидкі показники */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 18 }}>
          {[
            { l: "Хвилини", v: player.minutes ?? 0 },
            { l: "Матчі", v: player.matches ?? 0 },
            { l: "Голи", v: player.goals },
            { l: "Асисти", v: player.assists },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: "rgba(255,255,255,0.45)", border: "1px solid var(--glass-border-soft)",
                borderRadius: "var(--r-md)", padding: "9px 12px",
              }}
            >
              <p className="eyebrow" style={{ margin: 0, letterSpacing: "0.08em" }}>{s.l}</p>
              <AnimatedNumber
                value={s.v}
                duration={0.9}
                className="stat-num"
                style={{ fontSize: 18, fontWeight: 600, display: "block", marginTop: 3, color: "var(--text-1)" }}
              />
            </motion.div>
          ))}
        </div>

        {/* скаут-нотатка — заповнює простір у шапці */}
        <div style={{ marginTop: 18 }}>
          <ScoutNote text={scoutNote} />
        </div>
      </div>

        {/* поле позицій — окремий блок справа */}
        <div className="content-surface" style={{ display: "flex", flexDirection: "column", justifyContent: "center", marginTop: 40, padding: "20px 22px" }}>
          <PositionPitch primaryPosition={player.primaryPosition} detailedPositions={player.detailedPositions} />
        </div>
      </div>

      {/* ── Перемикач турнірів (якщо їх кілька) ── */}
      <TournamentSwitcher
        tournaments={tournaments}
        activeId={activeTournamentId}
        onSelect={handleTournament}
      />

      {/* ── Сильні сторони — заголовок постійний; висоту задає привид карток,
           тож плашка "мала вибірка" має ТАКУ Ж висоту, що й 4 картки ── */}
      <div>
        <p className="eyebrow" style={{ margin: "0 0 12px" }}>Сильні сторони</p>
        <div style={{ display: "grid" }}>
          {/* привид — невидимі картки, тримають висоту (завжди в потоці) */}
          <div style={{ gridArea: "1 / 1", visibility: "hidden", pointerEvents: "none" }} aria-hidden>
            <StrengthHighlights strengths={player.strengths} hideTitle />
          </div>
          {/* видимий вміст — поверх привида, розтягнутий на всю його висоту */}
          <div style={{ gridArea: "1 / 1", display: "flex", alignItems: "stretch" }}>
            {player.significant ? (
              <div style={{ width: "100%" }}>
                <StrengthHighlights strengths={player.strengths} hideTitle />
              </div>
            ) : (
              <div style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                background: "rgba(224,160,32,0.12)", border: "1px solid rgba(224,160,32,0.3)",
                borderRadius: "var(--r-md)", padding: "10px 14px",
              }}>
                <span style={{ fontSize: 16 }}>⚠</span>
                <span style={{ fontSize: 13, color: "#8a5a08" }}>
                  Замало ігрового часу в цьому турнірі ({player.minutes ?? 0} хв) — перцентилі можуть бути неточними.
                  {tournaments.length > 1 ? " Спробуй інший турнір вище." : ""}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Метрики: 3 збалансовані вертикальні колонки ──
           Радар у колонці 1, далі кожна категорія додається в НАЙКОРОТШУ
           колонку (за к-стю метрик). Працює для польових і воротарів. */}
      {(() => {
        // радар важить ~6 «рядків» при балансуванні висоти колонок
        const cols: { items: { name: string; metrics: PlayerProfile["metrics"] }[]; weight: number }[] = [
          { items: [], weight: 6 }, // колонка 1 уже містить радар
          { items: [], weight: 0 },
          { items: [], weight: 0 },
        ];
        // категорії від найбільшої до найменшої — кращий баланс
        const ordered = [...categories].sort((a, b) => b.metrics.length - a.metrics.length);
        for (const cat of ordered) {
          // +1 на заголовок категорії
          const w = cat.metrics.length + 1;
          const target = cols.reduce((min, c, i) => (c.weight < cols[min].weight ? i : min), 0);
          cols[target].items.push(cat);
          cols[target].weight += w;
        }
        return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, alignItems: "start" }}>
        {cols.map((col, ci) => (
          <div key={ci} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {ci === 0 && (
              <GlassCard style={{ padding: "18px 16px" }}>
                <p style={{ fontSize: 12, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "0 0 4px", textAlign: "center" }}>
                  Профіль vs середній
                </p>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Radar axes={axes} ghost={ghost} size={248} />
                </div>
                <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 4 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-2)" }}>
                    <span style={{ width: 14, height: 2, background: "var(--club-accent)", display: "inline-block" }} />
                    {player.name.split(" ").pop()}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-2)" }}>
                    <span style={{ width: 14, height: 0, borderTop: "2px dashed rgba(20,30,45,0.4)", display: "inline-block" }} />
                    сер. позиція
                  </span>
                </div>
              </GlassCard>
            )}
            {col.items.map((cat) => <MetricCard key={cat.name} cat={cat} />)}
          </div>
        ))}
      </div>
        );
      })()}
    </div>
  );
}

// Картка однієї групи метрик
function MetricCard({ cat }: { cat: { name: string; metrics: PlayerProfile["metrics"] } }) {
  return (
    <GlassCard style={{ padding: "18px 20px" }}>
      <p style={{ fontSize: 12, fontWeight: 500, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 10px" }}>
        {cat.name}
      </p>
      {cat.metrics.map((m, mi) => (
        <PercentileBar key={m.key} label={m.label} percentile={m.percentile} value={m.value} per90={m.per90} delay={mi * 0.04} />
      ))}
    </GlassCard>
  );
}
