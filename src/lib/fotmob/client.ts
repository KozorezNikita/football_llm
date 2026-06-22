import { chromium, type Browser, type BrowserContext } from "playwright";

// ─────────────────────────────────────────────────────────────
// FotMob-клієнт на Playwright (сторінковий підхід).
//
// Принцип: тримаємо ОДНУ браузерну сесію, відкриваємо сторінки команд/гравців,
// перехоплюємо внутрішні api/data відповіді (X-Mas генерує сам браузер).
//
// Доведено probe-експериментом: /api/data/playerData?id=X → 200 з повними даними.
// ─────────────────────────────────────────────────────────────

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export class FotMobClient {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor(
    private opts: { headless?: boolean; navTimeoutMs?: number } = {},
  ) {}

  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: this.opts.headless ?? true,
    });
    this.context = await this.browser.newContext({
      userAgent: UA,
      locale: "en-GB",
    });
  }

  async close(): Promise<void> {
    await this.browser?.close();
    this.browser = null;
    this.context = null;
  }

  // Відкриває сторінку, чекає на перехоплення api/data-відповіді, що містить matchUrl.
  private async fetchViaPage<T>(
    pageUrl: string,
    apiUrlMatch: string,
  ): Promise<T> {
    if (!this.context) throw new Error("FotMobClient not initialized — call init()");

    const page = await this.context.newPage();
    const navTimeout = this.opts.navTimeoutMs ?? 30000;

    try {
      let resolveHit: (data: T) => void;
      let rejectHit: (e: Error) => void;
      const hit = new Promise<T>((res, rej) => {
        resolveHit = res;
        rejectHit = rej;
      });

      page.on("response", async (response) => {
        const url = response.url();
        if (url.includes(apiUrlMatch)) {
          if (response.status() === 200) {
            try {
              const json = (await response.json()) as T;
              resolveHit(json);
            } catch (e) {
              rejectHit(new Error(`JSON parse failed for ${url}: ${(e as Error).message}`));
            }
          } else {
            rejectHit(new Error(`${apiUrlMatch} returned HTTP ${response.status()}`));
          }
        }
      });

      await page.goto(pageUrl, {
        waitUntil: "domcontentloaded",
        timeout: navTimeout,
      });

      // Перегони: або зловили api-відповідь, або таймаут.
      const data = await Promise.race([
        hit,
        new Promise<T>((_, rej) =>
          setTimeout(
            () => rej(new Error(`timeout: ${apiUrlMatch} не перехоплено за 25с`)),
            25000,
          ),
        ),
      ]);

      return data;
    } finally {
      await page.close();
    }
  }

  // Дані команди: профіль + склад (з id гравців + детальними позиціями).
  // Ендпоінт: /api/data/teams?id=<teamId>
  async getTeam(teamId: number): Promise<FotMobTeamResponse> {
    const pageUrl = `https://www.fotmob.com/en-GB/teams/${teamId}/overview/x`;
    return this.fetchViaPage<FotMobTeamResponse>(pageUrl, "/api/data/teams");
  }

  // Дані гравця: профіль + statsSection (метрики з per90/percentile).
  // Ендпоінт: /api/data/playerData?id=<playerId>
  async getPlayer(playerId: number): Promise<FotMobPlayerResponse> {
    const pageUrl = `https://www.fotmob.com/en-GB/players/${playerId}/x`;
    return this.fetchViaPage<FotMobPlayerResponse>(
      pageUrl,
      `/api/data/playerData?id=${playerId}`,
    );
  }

  // Дані ліги: профіль + турнірна таблиця (всі команди з teamId).
  // season (напр. "2025/2026") — щоб узяти ПОТРІБНИЙ сезон, а не поточний
  // за замовчуванням (для АПЛ поточний = 2026/2027, нам треба 2025/2026).
  // З season — через page.evaluate fetch (браузер сам додає X-Mas).
  async getLeague(leagueId: number, season?: string): Promise<FotMobLeagueResponse> {
    if (!season) {
      const pageUrl = `https://www.fotmob.com/en-GB/leagues/${leagueId}/overview/x`;
      return this.fetchViaPage<FotMobLeagueResponse>(
        pageUrl,
        `/api/data/leagues?id=${leagueId}`,
      );
    }

    if (!this.context) throw new Error("FotMobClient not initialized — call init()");
    const navTimeout = this.opts.navTimeoutMs ?? 30000;
    const page = await this.context.newPage();
    try {
      await page.goto(`https://www.fotmob.com/en-GB/leagues/${leagueId}/overview/x`, {
        waitUntil: "domcontentloaded",
        timeout: navTimeout,
      });
      await page.waitForTimeout(1500);
      const url = `/api/data/leagues?id=${leagueId}&season=${encodeURIComponent(season)}`;
      const data = await page.evaluate(async (u: string) => {
        const r = await fetch(u);
        if (r.status !== 200) return { __error: r.status };
        return r.json();
      }, url);
      if (data && (data as { __error?: number }).__error) {
        throw new Error(`leagues?season → HTTP ${(data as { __error: number }).__error}`);
      }
      return data as FotMobLeagueResponse;
    } finally {
      await page.close();
    }
  }

  // Статистика гравця по КОЖНОМУ турніру окремо.
  // Відкриває сторінку гравця ОДИН раз; на кожен турнір робить fetch
  // через page.evaluate — браузер сам додає X-Mas токен (probe довів).
  // requests: { seasonId (=entryId), isFirstSeason } зі statSeasons.
  // Повертає Map seasonId → відповідь playerStats.
  async getPlayerStatsMulti(
    playerId: number,
    requests: { seasonId: string; isFirstSeason: boolean }[],
  ): Promise<Map<string, FotMobPlayerStatsResponse>> {
    if (!this.context) throw new Error("FotMobClient not initialized — call init()");

    const page = await this.context.newPage();
    const navTimeout = this.opts.navTimeoutMs ?? 30000;
    const out = new Map<string, FotMobPlayerStatsResponse>();

    try {
      await page.goto(`https://www.fotmob.com/en-GB/players/${playerId}/x`, {
        waitUntil: "domcontentloaded",
        timeout: navTimeout,
      });
      // даємо FotMob ініціалізувати свій fetch-патч (X-Mas) при гідрації
      await page.waitForTimeout(1500);

      for (const req of requests) {
        const url =
          `/api/data/playerStats?playerId=${playerId}` +
          `&seasonId=${req.seasonId}&isFirstSeason=${req.isFirstSeason}`;
        const data = await page.evaluate(async (u: string) => {
          const r = await fetch(u);
          if (r.status !== 200) return { __error: r.status };
          return r.json();
        }, url);

        if (data && (data as { __error?: number }).__error) {
          console.warn(
            `    ⚠ playerStats ${req.seasonId} → HTTP ${(data as { __error: number }).__error}`,
          );
          continue;
        }
        out.set(req.seasonId, data as FotMobPlayerStatsResponse);
        await page.waitForTimeout(300);
      }
      return out;
    } finally {
      await page.close();
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Типи відповідей FotMob (за реальною структурою з probe).
// Свідомо неповні — лише потрібні поля + допуск на невідомі.
// ─────────────────────────────────────────────────────────────

export interface FotMobStatItem {
  localizedTitleId: string;
  title: string;
  statValue: string; // "10.97" — приходить рядком
  per90?: number;
  percentileRank?: number;
  percentileRankPer90?: number;
  statFormat?: string;
}

export interface FotMobStatGroup {
  localizedTitleId: string; // "shooting", "passing"...
  title: string;
  items: FotMobStatItem[];
}

export interface FotMobPlayerResponse {
  id: number;
  name: string;
  birthDate?: { utcTime?: string };
  primaryTeam?: { teamId?: number; teamName?: string };
  positionDescription?: {
    positions?: {
      strPos?: { label?: string; key?: string };
      isMainPosition?: boolean;
      occurences?: number;
    }[];
    primaryPosition?: { label?: string; key?: string };
    nonPrimaryPositions?: { label?: string; key?: string }[];
  };
  // firstSeasonStats: topStatCard (загальні) + statsSection (групи метрик)
  firstSeasonStats?: {
    topStatCard?: { items?: FotMobStatItem[] };
    statsSection?: { items?: FotMobStatGroup[] };
  };
  mainLeague?: {
    leagueId?: number;
    leagueName?: string;
    season?: string;
    stats?: { title?: string; localizedTitleId?: string; value?: string | number }[];
  };
  statSeasons?: {
    seasonName: string;
    tournaments: {
      name: string;
      tournamentId: number;
      entryId: string;
      hasDeepStats: boolean;
    }[];
  }[];
  // допуск на решту полів
  [key: string]: unknown;
}

// Відповідь playerStats — статистика ОДНОГО турніру.
// Форма topStatCard + statsSection ідентична firstSeasonStats.
export interface FotMobPlayerStatsResponse {
  sectionOrder?: string[];
  topStatCard?: { items?: FotMobStatItem[] };
  statsSection?: { items?: FotMobStatGroup[] };
  [key: string]: unknown;
}

export interface FotMobSquadMember {
  id: number;
  name: string;
  ccode?: string;
  cname?: string;
  age?: number;
  height?: number;
  shirtNumber?: number;
  positionIdsDesc?: string; // "LB,CB"
  role?: { key?: string; fallback?: string };
  rating?: number;
  goals?: number;
  assists?: number;
  transferValue?: number;
}

export interface FotMobTeamResponse {
  details?: {
    id?: number;
    name?: string;
    country?: string;
    latestSeason?: string;
  };
  squad?: {
    squad?: { title: string; members: FotMobSquadMember[] }[];
  };
  [key: string]: unknown;
}

// Рядок турнірної таблиці (table[0].data.table.all[]).
export interface FotMobTableRow {
  id: number; // teamId
  name: string;
  shortName?: string;
  played?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  pts?: number;
  scoresStr?: string; // "74-29"
  goalConDiff?: number;
  idx?: number; // позиція в таблиці
}

export interface FotMobLeagueResponse {
  details?: {
    id?: number;
    name?: string;
    country?: string; // у details інколи ccode
  };
  table?: {
    data?: {
      ccode?: string;
      leagueId?: number;
      leagueName?: string;
      table?: { all?: FotMobTableRow[] };
    };
  }[];
  [key: string]: unknown;
}
