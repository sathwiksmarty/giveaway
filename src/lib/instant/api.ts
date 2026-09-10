import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { isoDay, levelFromXp } from "@/lib/utils";
import {
  ACHIEVEMENTS,
  COSMETICS,
  GAMES,
  SKUS,
  dailyMissions,
  isHappyHour,
  isWeekendXp,
  xpMultiplier,
  type GameId,
} from "./catalog";

export type Profile = {
  user_id: string;
  username: string;
  display_name: string;
  avatar_id: string;
  title_id: string | null;
  frame_id: string | null;
  badge_id: string | null;
  equipped_car: string | null;
  equipped_weapon: string | null;
  equipped_fighter: string | null;
  referral_code: string;
  referred_by: string | null;
  xp: number;
  coins: number;
  level: number;
  streak_days: number;
  last_login_date: string | null;
  battle_pass_xp: number;
  battle_pass_premium: boolean;
  is_admin: boolean;
  banned: boolean;
  created_at: string;
};

function codeFrom(id: string) {
  const raw = id.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const tail = raw.slice(-4) || "PLAY";
  const n = [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 10000;
  return `IN${tail}${String(n).padStart(4, "0")}`.slice(0, 10);
}

function usernameFrom(id: string, name?: string | null) {
  const base = (name || "player")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 10) || "player";
  const n = [...id].reduce((a, c) => a + c.charCodeAt(0), 0) % 10000;
  return `${base}${n}`;
}

async function notify(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  kind: string,
  title: string,
  body: string,
  href?: string,
) {
  await sql`insert into notifications (user_id, kind, title, body, href)
    values (${userId}, ${kind}, ${title}, ${body}, ${href ?? null})`;
}

async function grantXp(
  sql: Awaited<ReturnType<typeof getSql>>,
  userId: string,
  amount: number,
  reason: string,
  gameId?: string,
) {
  if (amount <= 0) return 0;
  const rows = await sql<Profile>`select * from profiles where user_id = ${userId} limit 1`;
  const p = rows[0];
  if (!p || p.banned) return 0;
  const nextXp = p.xp + amount;
  const nextLevel = levelFromXp(nextXp);
  await sql`update profiles set xp = ${nextXp}, level = ${nextLevel},
    battle_pass_xp = battle_pass_xp + ${amount}
    where user_id = ${userId}`;
  await sql`insert into xp_ledger (user_id, amount, reason, game_id)
    values (${userId}, ${amount}, ${reason}, ${gameId ?? null})`;
  if (nextLevel > p.level) {
    await notify(sql, userId, "level", `Level ${nextLevel}`, "You ranked up.", "/dashboard");
  }
  return amount;
}

export const ensureProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { displayName?: string; image?: string | null } | undefined) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const existing = await sql<Profile>`select * from profiles where user_id = ${context.userId} limit 1`;
    if (existing[0]) {
      if (existing[0].banned) throw new Error("Account suspended");
      return existing[0];
    }
    const username = usernameFrom(context.userId, data?.displayName);
    const display = data?.displayName?.trim() || "Operator";
    const referral = codeFrom(context.userId);
    const admins = await sql<{ n: number }>`select count(*)::int as n from profiles where is_admin = true`;
    const isAdmin = (admins[0]?.n ?? 0) === 0;
    await sql`insert into profiles (user_id, username, display_name, referral_code, is_admin)
      values (${context.userId}, ${username}, ${display}, ${referral}, ${isAdmin})
      on conflict (user_id) do nothing`;
    const created = await sql<Profile>`select * from profiles where user_id = ${context.userId} limit 1`;
    const profile = created[0];
    if (profile) {
      await notify(
        sql,
        context.userId,
        "welcome",
        "Welcome to INSTANT",
        "Play a match to start climbing the weekly drop.",
        "/play",
      );
      await grantXp(sql, context.userId, 50, "welcome");
    }
    return (await sql<Profile>`select * from profiles where user_id = ${context.userId} limit 1`)[0];
  });

export const claimDaily = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Profile>`select * from profiles where user_id = ${context.userId} limit 1`;
    const p = rows[0];
    if (!p) return { claimed: false, xp: 0, streak: 0 };
    const today = isoDay();
    if (p.last_login_date === today) return { claimed: false, xp: 0, streak: p.streak_days };
    const y = new Date();
    y.setUTCDate(y.getUTCDate() - 1);
    const yesterday = isoDay(y);
    const streak = p.last_login_date === yesterday ? p.streak_days + 1 : 1;
    const bonus = 25 + Math.min(20, streak) * 5;
    await sql`update profiles set last_login_date = ${today}, streak_days = ${streak} where user_id = ${context.userId}`;
    await grantXp(sql, context.userId, bonus, "daily-login");
    return { claimed: true, xp: bonus, streak };
  });

export const getMe = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<Profile>`select * from profiles where user_id = ${context.userId} limit 1`;
    return rows[0] ?? null;
  });

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { username?: string; displayName?: string; avatarId?: string; referral?: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    if (data.username) {
      const u = data.username.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 16);
      if (u.length < 3) throw new Error("Username needs 3 characters");
      const taken = await sql<{ user_id: string }>`select user_id from profiles where username = ${u} and user_id <> ${context.userId}`;
      if (taken[0]) throw new Error("Username taken");
      await sql`update profiles set username = ${u} where user_id = ${context.userId}`;
    }
    if (data.displayName) {
      const n = data.displayName.trim().slice(0, 24);
      if (n) await sql`update profiles set display_name = ${n} where user_id = ${context.userId}`;
    }
    if (data.avatarId) {
      await sql`update profiles set avatar_id = ${data.avatarId} where user_id = ${context.userId}`;
    }
    if (data.referral) {
      const code = data.referral.trim().toUpperCase();
      const me = (await sql<Profile>`select * from profiles where user_id = ${context.userId}`)[0];
      if (me && !me.referred_by && code && code !== me.referral_code) {
        const ref = (await sql<Profile>`select * from profiles where referral_code = ${code} limit 1`)[0];
        if (ref && ref.user_id !== context.userId) {
          await sql`update profiles set referred_by = ${ref.user_id} where user_id = ${context.userId}`;
          await sql`insert into referrals (referrer_id, referee_id) values (${ref.user_id}, ${context.userId})
            on conflict (referee_id) do nothing`;
          await notify(sql, ref.user_id, "referral", "New recruit", `${me.display_name} joined on your code.`, "/referrals");
        }
      }
    }
    return (await sql<Profile>`select * from profiles where user_id = ${context.userId}`)[0];
  });

const RATE_WINDOW_MS = 60 * 60 * 1000;
const MAX_SUBMITS = 24;

export const submitScore = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    gameId: GameId;
    score: number;
    durationMs: number;
    meta?: Record<string, number | string | boolean>;
  }) => input)
  .handler(async ({ context, data }) => {
    const game = GAMES.find((g) => g.id === data.gameId);
    if (!game) throw new Error("Unknown game");
    const score = Math.max(0, Math.min(game.maxScore, Math.floor(Number(data.score) || 0)));
    const duration = Math.max(0, Math.floor(Number(data.durationMs) || 0));
    const sql = await getSql();
    const me = (await sql<Profile>`select * from profiles where user_id = ${context.userId}`)[0];
    if (!me) throw new Error("Profile missing");
    if (me.banned) throw new Error("Account suspended");

    const recent = await sql<{ n: number }>`
      select count(*)::int as n from scores
      where user_id = ${context.userId} and created_at > now() - interval '1 hour'`;
    if ((recent[0]?.n ?? 0) >= MAX_SUBMITS) {
      await sql`insert into fraud_alerts (user_id, kind, detail)
        values (${context.userId}, 'rate', ${"score submit cap"})`;
      throw new Error("Slow down — try again later");
    }

    if (duration < game.minDurationMs && score > game.maxScore * 0.15) {
      await sql`insert into fraud_alerts (user_id, kind, detail)
        values (${context.userId}, 'timing', ${`${data.gameId} ${score} in ${duration}ms`})`;
      throw new Error("Session too short for that score");
    }

    let xp = Math.floor(score / 40);
    if (data.gameId === "puzzle-quest") xp = Math.floor(score / 30);
    if (data.gameId === "color-rush") xp = Math.min(game.maxXp, Math.floor(score * 1.2));
    if (data.gameId === "neon-circuit") {
      const pos = Number(data.meta?.position ?? 8);
      const drift = Number(data.meta?.drift ?? 0);
      const clean = data.meta?.clean ? 40 : 0;
      xp = Math.floor((9 - pos) * 22 + drift / 80 + clean + score / 50);
    }
    if (data.gameId === "vector-strike") xp = Math.floor(Number(data.meta?.kills ?? 0) * 12 + score / 60);
    if (data.gameId === "iron-ring") xp = Math.floor((data.meta?.win ? 80 : 20) + Number(data.meta?.combo ?? 0) * 4);
    xp = Math.max(8, Math.min(game.maxXp, xp));

    let mult = xpMultiplier();
    const boostUntil = Number(data.meta?.boostUntil ?? 0);
    if (boostUntil && Date.now() < boostUntil) mult *= 2;
    xp = Math.floor(xp * Math.min(4, mult));

    await sql`insert into scores (user_id, game_id, score, xp_awarded, duration_ms, meta)
      values (${context.userId}, ${data.gameId}, ${score}, ${xp}, ${duration}, ${JSON.stringify(data.meta ?? {})})`;
    await grantXp(sql, context.userId, xp, `match:${data.gameId}`, data.gameId);

    const ref = (await sql<{ referrer_id: string; qualified: boolean }>`
      select referrer_id, qualified from referrals where referee_id = ${context.userId} limit 1`)[0];
    if (ref && !ref.qualified && me.xp + xp >= 100) {
      await sql`update referrals set qualified = true where referee_id = ${context.userId}`;
      await grantXp(sql, ref.referrer_id, 250, "referral-qualify");
      await notify(sql, ref.referrer_id, "referral", "Referral qualified", "Your recruit finished a real match.", "/referrals");
    }

    await notify(sql, context.userId, "xp", `+${xp} XP`, `${game.name} · ${score} pts`, "/dashboard");
    void RATE_WINDOW_MS;
    return { xp, score, multiplier: mult, weekend: isWeekendXp(), happyHour: isHappyHour() };
  });

export const getLeaderboard = createServerFn({ method: "GET" })
  .validator((input: { range?: "global" | "weekly" | "monthly" } | undefined) => input)
  .handler(async ({ data }) => {
    const sql = await getSql();
    const range = data?.range ?? "global";
    if (range === "weekly") {
      const players = await sql<{ user_id: string; username: string; display_name: string; avatar_id: string; title_id: string | null; xp: number; level: number }>`
        select p.user_id, p.username, p.display_name, p.avatar_id, p.title_id, coalesce(sum(l.amount),0)::int as xp, p.level
        from profiles p
        left join xp_ledger l on l.user_id = p.user_id and l.created_at > now() - interval '7 days'
        where p.banned = false
        group by p.user_id
        order by xp desc
        limit 40`;
      const bots = await sql<{ id: string; username: string; display_name: string; weekly_xp: number; level: number; title: string }>`
        select id, username, display_name, weekly_xp, level, title from rivals order by weekly_xp desc`;
      const mixed = [
        ...players.map((p) => ({ ...p, kind: "player" as const })),
        ...bots.map((b) => ({
          user_id: b.id,
          username: b.username,
          display_name: b.display_name,
          avatar_id: "a1",
          title_id: b.title,
          xp: b.weekly_xp,
          level: b.level,
          kind: "rival" as const,
        })),
      ]
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 25);
      return mixed;
    }
    if (range === "monthly") {
      const players = await sql<{ user_id: string; username: string; display_name: string; avatar_id: string; title_id: string | null; xp: number; level: number }>`
        select p.user_id, p.username, p.display_name, p.avatar_id, p.title_id, coalesce(sum(l.amount),0)::int as xp, p.level
        from profiles p
        left join xp_ledger l on l.user_id = p.user_id and l.created_at > now() - interval '30 days'
        where p.banned = false
        group by p.user_id
        order by xp desc
        limit 40`;
      const bots = await sql<{ id: string; username: string; display_name: string; monthly_xp: number; level: number; title: string }>`
        select id, username, display_name, monthly_xp, level, title from rivals order by monthly_xp desc`;
      return [
        ...players.map((p) => ({ ...p, kind: "player" as const })),
        ...bots.map((b) => ({
          user_id: b.id,
          username: b.username,
          display_name: b.display_name,
          avatar_id: "a1",
          title_id: b.title,
          xp: b.monthly_xp,
          level: b.level,
          kind: "rival" as const,
        })),
      ]
        .sort((a, b) => b.xp - a.xp)
        .slice(0, 25);
    }
    const players = await sql<{ user_id: string; username: string; display_name: string; avatar_id: string; title_id: string | null; xp: number; level: number }>`
      select user_id, username, display_name, avatar_id, title_id, xp, level from profiles where banned = false order by xp desc limit 40`;
    const bots = await sql<{ id: string; username: string; display_name: string; xp: number; level: number; title: string }>`
      select id, username, display_name, xp, level, title from rivals order by xp desc`;
    return [
      ...players.map((p) => ({ ...p, kind: "player" as const })),
      ...bots.map((b) => ({
        user_id: b.id,
        username: b.username,
        display_name: b.display_name,
        avatar_id: "a1",
        title_id: b.title,
        xp: b.xp,
        level: b.level,
        kind: "rival" as const,
      })),
    ]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 25);
  });

export const getWallet = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const ledger = await sql<{ id: number; amount: number; reason: string; game_id: string | null; created_at: string }>`
      select id, amount, reason, game_id, created_at from xp_ledger where user_id = ${context.userId} order by created_at desc limit 40`;
    const purchases = await sql<{ id: number; sku: string; amount_paise: number; method: string; status: string; created_at: string }>`
      select id, sku, amount_paise, method, status, created_at from purchases where user_id = ${context.userId} order by created_at desc limit 20`;
    const items = await sql<{ item_id: string; equipped: boolean; acquired_at: string }>`
      select item_id, equipped, acquired_at from inventory where user_id = ${context.userId}`;
    return { ledger, purchases, items };
  });

export const buyCosmetic = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { itemId: string }) => input)
  .handler(async ({ context, data }) => {
    const item = COSMETICS.find((c) => c.id === data.itemId);
    if (!item) throw new Error("Unknown item");
    const sql = await getSql();
    const me = (await sql<Profile>`select * from profiles where user_id = ${context.userId}`)[0];
    if (!me) throw new Error("Profile missing");
    const owned = await sql<{ id: number }>`select id from inventory where user_id = ${context.userId} and item_id = ${item.id}`;
    if (owned[0]) throw new Error("Already owned");
    if (me.coins < item.priceCoins) throw new Error("Not enough coins");
    await sql`update profiles set coins = coins - ${item.priceCoins} where user_id = ${context.userId}`;
    await sql`insert into inventory (user_id, item_id) values (${context.userId}, ${item.id})`;
    await notify(sql, context.userId, "shop", "Unlocked", item.name, "/inventory");
    return { ok: true };
  });

export const equipItem = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { itemId: string }) => input)
  .handler(async ({ context, data }) => {
    const item = COSMETICS.find((c) => c.id === data.itemId);
    if (!item) throw new Error("Unknown item");
    const sql = await getSql();
    const owned = await sql<{ id: number }>`select id from inventory where user_id = ${context.userId} and item_id = ${item.id}`;
    if (!owned[0]) throw new Error("Not owned");
    await sql`update inventory set equipped = false from (
      select i.id from inventory i where i.user_id = ${context.userId}
    ) x where inventory.id = x.id`;
    await sql`update inventory set equipped = true where user_id = ${context.userId} and item_id = ${item.id}`;
    const col =
      item.kind === "title"
        ? "title_id"
        : item.kind === "frame"
          ? "frame_id"
          : item.kind === "badge"
            ? "badge_id"
            : item.kind === "car"
              ? "equipped_car"
              : item.kind === "weapon"
                ? "equipped_weapon"
                : item.kind === "character"
                  ? "equipped_fighter"
                  : null;
    if (col) {
      await sql.query(`update profiles set ${col} = $1 where user_id = $2`, [item.id, context.userId]);
    }
    return { ok: true };
  });

export const checkout = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { sku: string; method: string }) => input)
  .handler(async ({ context, data }) => {
    const sku = SKUS.find((s) => s.id === data.sku);
    if (!sku) throw new Error("Unknown SKU");
    const method = ["upi", "gpay", "phonepe", "card"].includes(data.method) ? data.method : "upi";
    const sql = await getSql();
    await sql`insert into purchases (user_id, sku, amount_paise, method, status)
      values (${context.userId}, ${sku.id}, ${sku.paise}, ${method}, ${"paid"})`;
    if (sku.grant === "coins") {
      await sql`update profiles set coins = coins + ${sku.coins} where user_id = ${context.userId}`;
    }
    if (sku.grant === "pass") {
      await sql`update profiles set battle_pass_premium = true where user_id = ${context.userId}`;
    }
    if (sku.grant === "boost") {
      await notify(sql, context.userId, "boost", "XP Booster armed", "2× XP on your next hour of play.", "/play");
    }
    await notify(sql, context.userId, "purchase", "Payment received", `${sku.name} · ${method}`, "/wallet");
    return { ok: true, sku: sku.id, method, amount: sku.paise, boostUntil: sku.grant === "boost" ? Date.now() + 3600000 : 0 };
  });

export const getNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: number; kind: string; title: string; body: string; href: string | null; read: boolean; created_at: string }>`
      select id, kind, title, body, href, read, created_at from notifications
      where user_id = ${context.userId} order by created_at desc limit 40`;
  });

export const markNotifications = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    await sql`update notifications set read = true where user_id = ${context.userId}`;
    return { ok: true };
  });

export const getHistory = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    return sql<{ id: number; game_id: string; score: number; xp_awarded: number; duration_ms: number; created_at: string }>`
      select id, game_id, score, xp_awarded, duration_ms, created_at from scores
      where user_id = ${context.userId} order by created_at desc limit 40`;
  });

export const getFriends = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ friend_id: string; status: string; username: string; display_name: string; avatar_id: string; xp: number; level: number }>`
      select f.friend_id, f.status, p.username, p.display_name, p.avatar_id, p.xp, p.level
      from friends f join profiles p on p.user_id = f.friend_id
      where f.user_id = ${context.userId}
      order by f.created_at desc`;
    const incoming = await sql<{ user_id: string; username: string; display_name: string; avatar_id: string }>`
      select f.user_id, p.username, p.display_name, p.avatar_id
      from friends f join profiles p on p.user_id = f.user_id
      where f.friend_id = ${context.userId} and f.status = 'pending'`;
    return { rows, incoming };
  });

export const friendAction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { username?: string; userId?: string; action: "add" | "accept" | "remove" }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    let target = data.userId;
    if (data.username) {
      const u = data.username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const row = (await sql<{ user_id: string }>`select user_id from profiles where username = ${u} limit 1`)[0];
      if (!row) throw new Error("Player not found");
      target = row.user_id;
    }
    if (!target || target === context.userId) throw new Error("Invalid player");
    if (data.action === "add") {
      await sql`insert into friends (user_id, friend_id, status) values (${context.userId}, ${target}, ${"pending"})
        on conflict do nothing`;
      await notify(sql, target, "friend", "Friend request", "Someone wants to squad up.", "/friends");
    } else if (data.action === "accept") {
      await sql`update friends set status = ${"accepted"} where user_id = ${target} and friend_id = ${context.userId}`;
      await sql`insert into friends (user_id, friend_id, status) values (${context.userId}, ${target}, ${"accepted"})
        on conflict do nothing`;
    } else {
      await sql`delete from friends where (user_id = ${context.userId} and friend_id = ${target})
        or (user_id = ${target} and friend_id = ${context.userId})`;
    }
    return { ok: true };
  });

export const getMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((input: { withId: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    return sql<{ id: number; from_id: string; to_id: string; body: string; created_at: string }>`
      select id, from_id, to_id, body, created_at from messages
      where (from_id = ${context.userId} and to_id = ${data.withId})
         or (from_id = ${data.withId} and to_id = ${context.userId})
      order by created_at asc limit 80`;
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { toId: string; body: string }) => input)
  .handler(async ({ context, data }) => {
    const body = data.body.trim().slice(0, 280);
    if (!body) throw new Error("Empty");
    const sql = await getSql();
    await sql`insert into messages (from_id, to_id, body) values (${context.userId}, ${data.toId}, ${body})`;
    return { ok: true };
  });

export const getMissions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const day = isoDay();
    const list = dailyMissions(day);
    const sql = await getSql();
    const rows = await sql<{ mission_id: string; progress: number; claimed: boolean }>`
      select mission_id, progress, claimed from mission_progress where user_id = ${context.userId} and day = ${day}`;
    const map = Object.fromEntries(rows.map((r) => [r.mission_id, r]));
    return list.map((m) => ({
      ...m,
      progress: map[m.id]?.progress ?? 0,
      claimed: map[m.id]?.claimed ?? false,
    }));
  });

export const bumpMission = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { stat: string; amount?: number }) => input)
  .handler(async ({ context, data }) => {
    const day = isoDay();
    const list = dailyMissions(day);
    const sql = await getSql();
    const amt = data.amount ?? 1;
    for (const m of list) {
      if (m.stat !== data.stat) continue;
      await sql`insert into mission_progress (user_id, mission_id, day, progress)
        values (${context.userId}, ${m.id}, ${day}, ${amt})
        on conflict (user_id, mission_id, day)
        do update set progress = mission_progress.progress + ${amt}`;
    }
    return { ok: true };
  });

export const claimMission = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { missionId: string }) => input)
  .handler(async ({ context, data }) => {
    const day = isoDay();
    const m = dailyMissions(day).find((x) => x.id === data.missionId);
    if (!m) throw new Error("Unknown mission");
    const sql = await getSql();
    const row = (await sql<{ progress: number; claimed: boolean }>`
      select progress, claimed from mission_progress
      where user_id = ${context.userId} and mission_id = ${m.id} and day = ${day}`)[0];
    if (!row || row.claimed || row.progress < m.target) throw new Error("Not ready");
    await sql`update mission_progress set claimed = true
      where user_id = ${context.userId} and mission_id = ${m.id} and day = ${day}`;
    await grantXp(sql, context.userId, m.xp, "mission");
    return { xp: m.xp };
  });

export const getAchievements = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const unlocked = await sql<{ achievement_id: string; unlocked_at: string }>`
      select achievement_id, unlocked_at from achievement_unlocks where user_id = ${context.userId}`;
    const set = new Set(unlocked.map((u) => u.achievement_id));
    return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: set.has(a.id) }));
  });

export const unlockAchievement = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    const a = ACHIEVEMENTS.find((x) => x.id === data.id);
    if (!a) return { ok: false };
    const sql = await getSql();
    const exists = await sql<{ achievement_id: string }>`
      select achievement_id from achievement_unlocks where user_id = ${context.userId} and achievement_id = ${a.id}`;
    if (exists[0]) return { ok: true, already: true };
    await sql`insert into achievement_unlocks (user_id, achievement_id) values (${context.userId}, ${a.id})`;
    await grantXp(sql, context.userId, a.xp, "achievement");
    await notify(sql, context.userId, "achieve", a.name, a.desc, "/achievements");
    return { ok: true, xp: a.xp };
  });

export const getReferrals = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const rows = await sql<{ referee_id: string; qualified: boolean; created_at: string; username: string; display_name: string }>`
      select r.referee_id, r.qualified, r.created_at, p.username, p.display_name
      from referrals r join profiles p on p.user_id = r.referee_id
      where r.referrer_id = ${context.userId}
      order by r.created_at desc`;
    return rows;
  });

export const getAdminSnapshot = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getSql();
    const me = (await sql<Profile>`select * from profiles where user_id = ${context.userId}`)[0];
    if (!me?.is_admin) throw new Error("Forbidden");
    const users = await sql<Profile>`select * from profiles order by created_at desc limit 80`;
    const alerts = await sql<{ id: number; user_id: string; kind: string; detail: string; created_at: string }>`
      select id, user_id, kind, detail, created_at from fraud_alerts order by created_at desc limit 40`;
    const reports = await sql<{ id: number; reporter_id: string; target_id: string; reason: string; status: string; created_at: string }>`
      select id, reporter_id, target_id, reason, status, created_at from reports order by created_at desc limit 40`;
    const revenue = await sql<{ n: number; sum: number }>`
      select count(*)::int as n, coalesce(sum(amount_paise),0)::int as sum from purchases where status = 'paid'`;
    const dau = await sql<{ n: number }>`
      select count(distinct user_id)::int as n from xp_ledger where created_at > now() - interval '1 day'`;
    const mau = await sql<{ n: number }>`
      select count(distinct user_id)::int as n from xp_ledger where created_at > now() - interval '30 days'`;
    const games = await sql<{ game_id: string; n: number }>`
      select game_id, count(*)::int as n from scores group by game_id order by n desc`;
    return {
      users,
      alerts,
      reports,
      revenue: revenue[0] ?? { n: 0, sum: 0 },
      dau: dau[0]?.n ?? 0,
      mau: mau[0]?.n ?? 0,
      games,
    };
  });

export const adminAct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { action: "ban" | "unban" | "verify"; userId?: string; winnerId?: number }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getSql();
    const me = (await sql<Profile>`select * from profiles where user_id = ${context.userId}`)[0];
    if (!me?.is_admin) throw new Error("Forbidden");
    if (data.action === "ban" && data.userId) {
      await sql`update profiles set banned = true where user_id = ${data.userId}`;
    }
    if (data.action === "unban" && data.userId) {
      await sql`update profiles set banned = false where user_id = ${data.userId}`;
    }
    if (data.action === "verify" && data.winnerId) {
      await sql`update giveaway_winners set verified = true where id = ${data.winnerId}`;
    }
    return { ok: true };
  });

export const publicStats = createServerFn({ method: "GET" }).handler(async () => {
  const sql = await getSql();
  const players = await sql<{ n: number }>`select count(*)::int as n from profiles`;
  const matches = await sql<{ n: number }>`select count(*)::int as n from scores`;
  return {
    players: (players[0]?.n ?? 0) + 20,
    matches: matches[0]?.n ?? 0,
    liveGiveaway: true,
  };
});
