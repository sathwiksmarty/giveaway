export type Rarity = "common" | "rare" | "epic" | "legendary" | "mythic";
export type GameId =
  | "puzzle-quest"
  | "memory-flip"
  | "color-rush"
  | "neon-circuit"
  | "vector-strike"
  | "iron-ring";

export type CosmeticKind =
  | "car"
  | "weapon"
  | "character"
  | "emoji"
  | "frame"
  | "badge"
  | "title";

export const GAMES: {
  id: GameId;
  name: string;
  tag: string;
  blurb: string;
  cover: string;
  category: "puzzle" | "action" | "racing" | "multiplayer";
  players: string;
  maxXp: number;
  maxScore: number;
  minDurationMs: number;
}[] = [
  {
    id: "puzzle-quest",
    name: "Puzzle Quest",
    tag: "100 Levels",
    blurb: "Match luminous gems, chain combos, and climb 100 seeded boards.",
    cover: "/games/puzzle.jpg",
    category: "puzzle",
    players: "Solo",
    maxXp: 180,
    maxScore: 250000,
    minDurationMs: 4000,
  },
  {
    id: "memory-flip",
    name: "Memory Flip",
    tag: "Duel",
    blurb: "Flip sigil cards against a rising AI. Perfect recall pays XP.",
    cover: "/games/memory.jpg",
    category: "multiplayer",
    players: "1–2",
    maxXp: 140,
    maxScore: 20000,
    minDurationMs: 4000,
  },
  {
    id: "color-rush",
    name: "Color Rush",
    tag: "Endless",
    blurb: "Hit the matching gate. Miss once and the run is over.",
    cover: "/games/color.jpg",
    category: "action",
    players: "Solo",
    maxXp: 200,
    maxScore: 99999,
    minDurationMs: 3000,
  },
  {
    id: "neon-circuit",
    name: "Neon Circuit",
    tag: "Racing",
    blurb: "Arcade grand tourer. Drift, nitro, weather, six circuits.",
    cover: "/games/racing.jpg",
    category: "racing",
    players: "Solo + AI",
    maxXp: 280,
    maxScore: 50000,
    minDurationMs: 8000,
  },
  {
    id: "vector-strike",
    name: "Vector Strike",
    tag: "Arena FPS",
    blurb: "Hitscan arena. Patrol AI, cover, three fictional arms.",
    cover: "/games/fps.jpg",
    category: "action",
    players: "Solo",
    maxXp: 260,
    maxScore: 40000,
    minDurationMs: 8000,
  },
  {
    id: "iron-ring",
    name: "Iron Ring",
    tag: "Fighting",
    blurb: "Seven original fighters. Combos, specials, slow-motion finish.",
    cover: "/games/fight.jpg",
    category: "action",
    players: "1–2",
    maxXp: 240,
    maxScore: 30000,
    minDurationMs: 6000,
  },
];

export const CARS = [
  {
    id: "vesper-x9",
    name: "Vesper X9",
    inspired: "Hypercar coupe",
    color: "#6d8cff",
    accel: 18,
    maxSpeed: 78,
    grip: 0.86,
    nitro: 1.35,
  },
  {
    id: "stradale",
    name: "Stradale Veloce",
    inspired: "Italian supercar",
    color: "#e06a72",
    accel: 16,
    maxSpeed: 74,
    grip: 0.9,
    nitro: 1.28,
  },
  {
    id: "hayabusa",
    name: "Hayabusa GT",
    inspired: "Japanese tuner",
    color: "#6ed9a0",
    accel: 20,
    maxSpeed: 70,
    grip: 0.8,
    nitro: 1.4,
  },
  {
    id: "konig",
    name: "König RS",
    inspired: "German GT",
    color: "#8b90a0",
    accel: 14,
    maxSpeed: 76,
    grip: 0.94,
    nitro: 1.22,
  },
  {
    id: "voltara",
    name: "Voltara S",
    inspired: "Electric sedan",
    color: "#d4b56a",
    accel: 22,
    maxSpeed: 72,
    grip: 0.88,
    nitro: 1.45,
  },
] as const;

export const TRACKS = [
  { id: "tokyo", name: "Tokyo Highway", weather: "clear", tod: "night", fog: 0.04, rain: false },
  { id: "dubai", name: "Dubai Night", weather: "haze", tod: "night", fog: 0.02, rain: false },
  { id: "mountain", name: "Mountain Drift", weather: "clear", tod: "dusk", fog: 0.06, rain: false },
  { id: "rain", name: "Rain Highway", weather: "storm", tod: "night", fog: 0.1, rain: true },
  { id: "desert", name: "Desert Track", weather: "dust", tod: "day", fog: 0.05, rain: false },
  { id: "forest", name: "Forest Track", weather: "mist", tod: "day", fog: 0.12, rain: false },
] as const;

export const WEAPONS = [
  { id: "pulse-9", name: "Pulse-9", class: "Rifle", rpm: 620, mag: 28, dmg: 18 },
  { id: "shard-12", name: "Shard-12", class: "Scatter", rpm: 90, mag: 6, dmg: 12 },
  { id: "needle", name: "Needle Rail", class: "Rail", rpm: 48, mag: 4, dmg: 72 },
  { id: "ember", name: "Ember Compact", class: "Sidearm", rpm: 280, mag: 12, dmg: 22 },
] as const;

export const ARENAS = [
  { id: "warehouse", name: "Warehouse" },
  { id: "desert", name: "Desert Yard" },
  { id: "city", name: "Night District" },
  { id: "forest", name: "Pineworks" },
  { id: "industrial", name: "Foundry" },
] as const;

export const FIGHTERS = [
  { id: "voss", name: "Kade Voss", title: "Office Boss", color: "#6d8cff", special: "Deadline" },
  { id: "lyra", name: "Lyra Chen", title: "Manager", color: "#d4b56a", special: "Quarter Close" },
  { id: "unit7", name: "UNIT-7", title: "Robot", color: "#8b90a0", special: "Overclock" },
  { id: "kage", name: "Kage", title: "Ninja", color: "#6ed9a0", special: "Afterimage" },
  { id: "pike", name: "Marlon Pike", title: "Boxer", color: "#e06a72", special: "Liver Shot" },
  { id: "vex", name: "Don Vex", title: "Mafia Boss", color: "#8b7cff", special: "Black Ledger" },
  { id: "ryn", name: "Ryn", title: "Street Fighter", color: "#e0b45c", special: "Alley Rush" },
] as const;

export type Cosmetic = {
  id: string;
  name: string;
  kind: CosmeticKind;
  rarity: Rarity;
  priceCoins: number;
  blurb: string;
};

export const COSMETICS: Cosmetic[] = [
  { id: "car-vesper", name: "Vesper X9", kind: "car", rarity: "legendary", priceCoins: 2400, blurb: "Hypercar coupe skin." },
  { id: "car-stradale", name: "Stradale Veloce", kind: "car", rarity: "epic", priceCoins: 1600, blurb: "Open-gate Italian line." },
  { id: "car-hayabusa", name: "Hayabusa GT", kind: "car", rarity: "rare", priceCoins: 900, blurb: "Night tuner livery." },
  { id: "car-konig", name: "König RS", kind: "car", rarity: "epic", priceCoins: 1500, blurb: "GT endurance wrap." },
  { id: "car-voltara", name: "Voltara S", kind: "car", rarity: "mythic", priceCoins: 3200, blurb: "Silent gold electric." },
  { id: "wpn-pulse", name: "Pulse-9 Skin", kind: "weapon", rarity: "rare", priceCoins: 700, blurb: "Cyan lattice receiver." },
  { id: "wpn-shard", name: "Shard-12 Skin", kind: "weapon", rarity: "epic", priceCoins: 1100, blurb: "Faceted scatter housing." },
  { id: "wpn-needle", name: "Needle Rail Skin", kind: "weapon", rarity: "legendary", priceCoins: 1800, blurb: "Gold-traced rail." },
  { id: "wpn-ember", name: "Ember Compact Skin", kind: "weapon", rarity: "common", priceCoins: 320, blurb: "Warm sidearm plate." },
  { id: "chr-voss", name: "Voss Executive", kind: "character", rarity: "rare", priceCoins: 800, blurb: "Charcoal suit cut." },
  { id: "chr-kage", name: "Kage Shadow", kind: "character", rarity: "legendary", priceCoins: 2100, blurb: "Void-stitched gi." },
  { id: "chr-unit7", name: "UNIT-7 Chrome", kind: "character", rarity: "epic", priceCoins: 1400, blurb: "Mirror chassis." },
  { id: "chr-ryn", name: "Ryn Street Gold", kind: "character", rarity: "mythic", priceCoins: 2800, blurb: "Champion tape." },
  { id: "emo-pulse", name: "Pulse", kind: "emoji", rarity: "common", priceCoins: 80, blurb: "Chat reaction." },
  { id: "emo-crown", name: "Crown", kind: "emoji", rarity: "rare", priceCoins: 180, blurb: "Podium reaction." },
  { id: "emo-drift", name: "Drift", kind: "emoji", rarity: "rare", priceCoins: 180, blurb: "Tire-smoke glyph." },
  { id: "emo-skull", name: "Echo", kind: "emoji", rarity: "epic", priceCoins: 260, blurb: "Finish reaction." },
  { id: "frm-thin", name: "Hairline Frame", kind: "frame", rarity: "common", priceCoins: 120, blurb: "Quiet avatar ring." },
  { id: "frm-volt", name: "Volt Frame", kind: "frame", rarity: "rare", priceCoins: 340, blurb: "Blue circuit ring." },
  { id: "frm-gold", name: "Gilded Frame", kind: "frame", rarity: "legendary", priceCoins: 900, blurb: "Winner's bevel." },
  { id: "bdg-rookie", name: "Rookie Mark", kind: "badge", rarity: "common", priceCoins: 60, blurb: "First season pin." },
  { id: "bdg-pilot", name: "Circuit Pilot", kind: "badge", rarity: "epic", priceCoins: 420, blurb: "Race qualified." },
  { id: "bdg-ace", name: "Arena Ace", kind: "badge", rarity: "legendary", priceCoins: 880, blurb: "Vector qualified." },
  { id: "ttl-spark", name: "Spark", kind: "title", rarity: "common", priceCoins: 100, blurb: "Starter title." },
  { id: "ttl-phantom", name: "Circuit Phantom", kind: "title", rarity: "epic", priceCoins: 600, blurb: "Night driver." },
  { id: "ttl-saint", name: "Iron Saint", kind: "title", rarity: "legendary", priceCoins: 1200, blurb: "Ring closer." },
  { id: "ttl-warden", name: "Chrome Warden", kind: "title", rarity: "mythic", priceCoins: 2000, blurb: "Season apex." },
];

export const SKUS = [
  { id: "xp-boost-9", name: "XP Booster", blurb: "2× XP for 60 minutes.", paise: 900, coins: 0, grant: "boost" as const },
  { id: "coins-40", name: "40 Coins", blurb: "Starter pack.", paise: 4900, coins: 40, grant: "coins" as const },
  { id: "coins-120", name: "120 Coins", blurb: "Best for a skin.", paise: 9900, coins: 120, grant: "coins" as const },
  { id: "coins-280", name: "280 Coins", blurb: "Season stack.", paise: 19900, coins: 280, grant: "coins" as const },
  { id: "battle-pass", name: "Season Pass", blurb: "Unlock the premium track.", paise: 14900, coins: 0, grant: "pass" as const },
];

export const PAYMENT_METHODS = [
  { id: "upi", name: "UPI" },
  { id: "gpay", name: "Google Pay" },
  { id: "phonepe", name: "PhonePe" },
  { id: "card", name: "Card" },
] as const;

export const AVATARS = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8"] as const;

export const GIVEAWAYS = [
  {
    id: "headset-s1",
    name: "Pulse Wireless Headset",
    kind: "gadget",
    image: "/art/headset.jpg",
    value: "₹18,900",
    blurb: "Closed-back wireless cans. Awarded to the weekly XP podium.",
    winners: 3,
  },
  {
    id: "nightline-tix",
    name: "Nightline Festival Pair",
    kind: "concert",
    image: "/art/tickets.jpg",
    value: "₹12,000",
    blurb: "Two floor tickets. Eligible players must finish 5 matches that week.",
    winners: 2,
  },
  {
    id: "vault-card",
    name: "Vault Gift Card",
    kind: "gift-card",
    image: "/games/memory.jpg",
    value: "₹5,000",
    blurb: "Store credit. Top monthly grinders.",
    winners: 5,
  },
  {
    id: "merch-drop",
    name: "INSTANT Field Hoodie",
    kind: "merch",
    image: "/games/fight.jpg",
    value: "₹4,400",
    blurb: "Heavyweight merch drop. Referral-qualified players only.",
    winners: 10,
  },
];

export const CAREERS = [
  { id: "gameplay", title: "Gameplay Engineer", loc: "Remote · Bengaluru", type: "Full-time" },
  { id: "liveops", title: "Live Ops Producer", loc: "Remote", type: "Full-time" },
  { id: "security", title: "Anti-Cheat Engineer", loc: "Remote", type: "Full-time" },
  { id: "brand", title: "Brand Designer", loc: "Mumbai / Remote", type: "Contract" },
];

export const FAQS = [
  { q: "Is INSTANT free to play?", a: "Yes. Every game, leaderboard, and weekly giveaway is free. Cosmetics and the Season Pass are optional." },
  { q: "How do giveaways pick winners?", a: "Weekly XP on the live leaderboard, minus flagged sessions. Top valid players are verified by operators before prizes ship." },
  { q: "How is XP awarded?", a: "Server-side only. Scores are capped, rate-limited, and checked against session duration. Clients never write XP directly." },
  { q: "Can I buy a win?", a: "No. Boosters multiply XP from play. They do not grant leaderboard rank by themselves." },
  { q: "What is a referral code?", a: "Every player gets a unique code. You earn XP after the friend signs in and completes a qualifying match." },
  { q: "Which payments are supported?", a: "UPI, Google Pay, PhonePe, and cards via the in-app checkout. Purchases are recorded on your wallet." },
];

function makePass() {
  const items: { level: number; free: string; premium: string }[] = [];
  for (let i = 1; i <= 100; i++) {
    const free = i % 5 === 0 ? `${40 + i} XP` : i % 10 === 0 ? "Common cosmetic" : "—";
    const premium =
      i % 25 === 0
        ? "Legendary drop"
        : i % 10 === 0
          ? "Rare skin"
          : i % 5 === 0
            ? `${80 + i * 2} coins`
            : `${20 + i} XP`;
    items.push({ level: i, free, premium });
  }
  return items;
}

export const BATTLE_PASS = makePass();
export const BP_XP_PER_LEVEL = 800;

export const ACHIEVEMENTS: { id: string; name: string; desc: string; xp: number; target: number; stat: string }[] = [
  { id: "first-blood", name: "First Circuit", desc: "Finish any match.", xp: 40, target: 1, stat: "matches" },
  { id: "ten-matches", name: "Warm Hands", desc: "Finish 10 matches.", xp: 80, target: 10, stat: "matches" },
  { id: "fifty-matches", name: "Resident", desc: "Finish 50 matches.", xp: 160, target: 50, stat: "matches" },
  { id: "hundred-matches", name: "Fixture", desc: "Finish 100 matches.", xp: 300, target: 100, stat: "matches" },
  { id: "puzzle-1", name: "Gem Cut", desc: "Clear Puzzle Quest level 1.", xp: 30, target: 1, stat: "puzzle_level" },
  { id: "puzzle-25", name: "Facet", desc: "Reach Puzzle Quest level 25.", xp: 90, target: 25, stat: "puzzle_level" },
  { id: "puzzle-50", name: "Lattice", desc: "Reach Puzzle Quest level 50.", xp: 140, target: 50, stat: "puzzle_level" },
  { id: "puzzle-100", name: "Crown Jewel", desc: "Clear all 100 puzzle boards.", xp: 400, target: 100, stat: "puzzle_level" },
  { id: "memory-perfect", name: "Total Recall", desc: "Clear a memory board with no mismatches.", xp: 80, target: 1, stat: "memory_perfect" },
  { id: "memory-ai", name: "Outplayed", desc: "Beat the memory AI.", xp: 70, target: 1, stat: "memory_ai" },
  { id: "rush-50", name: "Gate 50", desc: "Reach 50 in Color Rush.", xp: 90, target: 50, stat: "rush_best" },
  { id: "rush-100", name: "Gate 100", desc: "Reach 100 in Color Rush.", xp: 180, target: 100, stat: "rush_best" },
  { id: "race-first", name: "Green Flag", desc: "Finish a Neon Circuit race.", xp: 50, target: 1, stat: "races" },
  { id: "race-drift", name: "Long Slide", desc: "Score 2,000 drift in one race.", xp: 100, target: 2000, stat: "drift" },
  { id: "race-clean", name: "Clean Line", desc: "Finish a race without a wall hit.", xp: 120, target: 1, stat: "clean_race" },
  { id: "race-tokyo", name: "Shuto Pass", desc: "Finish Tokyo Highway.", xp: 60, target: 1, stat: "track_tokyo" },
  { id: "race-rain", name: "Wet Rubber", desc: "Finish Rain Highway.", xp: 70, target: 1, stat: "track_rain" },
  { id: "fps-10", name: "Warm Barrel", desc: "10 Vector Strike eliminations.", xp: 80, target: 10, stat: "kills" },
  { id: "fps-50", name: "Operator", desc: "50 Vector Strike eliminations.", xp: 160, target: 50, stat: "kills" },
  { id: "fps-head", name: "Needlework", desc: "Land a Needle Rail elimination.", xp: 90, target: 1, stat: "rail_kill" },
  { id: "fps-survive", name: "Still Standing", desc: "Survive 3 minutes in arena.", xp: 110, target: 180000, stat: "survive_ms" },
  { id: "fight-win", name: "First Bell", desc: "Win an Iron Ring bout.", xp: 60, target: 1, stat: "fight_wins" },
  { id: "fight-combo", name: "String Theory", desc: "Land a 6-hit combo.", xp: 90, target: 6, stat: "combo" },
  { id: "fight-all", name: "Full Roster", desc: "Win once with every fighter.", xp: 200, target: 7, stat: "roster" },
  { id: "xp-1k", name: "Thousand", desc: "Earn 1,000 XP.", xp: 50, target: 1000, stat: "xp" },
  { id: "xp-10k", name: "Ten K", desc: "Earn 10,000 XP.", xp: 120, target: 10000, stat: "xp" },
  { id: "xp-50k", name: "Half Vault", desc: "Earn 50,000 XP.", xp: 250, target: 50000, stat: "xp" },
  { id: "level-10", name: "Double Digits", desc: "Reach player level 10.", xp: 80, target: 10, stat: "level" },
  { id: "level-25", name: "Seasoned", desc: "Reach player level 25.", xp: 160, target: 25, stat: "level" },
  { id: "streak-3", name: "Three Nights", desc: "Login streak of 3.", xp: 40, target: 3, stat: "streak" },
  { id: "streak-7", name: "Weeknight", desc: "Login streak of 7.", xp: 90, target: 7, stat: "streak" },
  { id: "streak-30", name: "Calendar", desc: "Login streak of 30.", xp: 300, target: 30, stat: "streak" },
  { id: "friend-1", name: "Plus One", desc: "Add a friend.", xp: 40, target: 1, stat: "friends" },
  { id: "ref-1", name: "Invite", desc: "Qualify one referral.", xp: 80, target: 1, stat: "referrals" },
  { id: "ref-5", name: "Room", desc: "Qualify five referrals.", xp: 200, target: 5, stat: "referrals" },
  { id: "shop-1", name: "First Drop", desc: "Buy any cosmetic.", xp: 40, target: 1, stat: "purchases" },
  { id: "pass", name: "Season Ticket", desc: "Unlock the premium track.", xp: 100, target: 1, stat: "pass" },
  { id: "mission-10", name: "Taskmaster", desc: "Claim 10 daily missions.", xp: 90, target: 10, stat: "missions" },
  { id: "all-games", name: "Hex", desc: "Play all six titles.", xp: 180, target: 6, stat: "unique_games" },
  { id: "podium", name: "Lights", desc: "Enter a weekly top 10.", xp: 220, target: 1, stat: "podium" },
  { id: "night-owl", name: "Night Owl", desc: "Play after 00:00 local.", xp: 40, target: 1, stat: "night" },
  { id: "boost", name: "Overclocked", desc: "Finish a match during 2× XP.", xp: 50, target: 1, stat: "boosted" },
  { id: "no-miss-rush", name: "Clean Gates", desc: "Color Rush 25 with no miss.", xp: 110, target: 25, stat: "rush_clean" },
  { id: "puzzle-stars", name: "Triple Cut", desc: "Earn 3 stars on 10 boards.", xp: 140, target: 10, stat: "three_star" },
  { id: "wallet-500", name: "Float", desc: "Hold 500 coins.", xp: 70, target: 500, stat: "coins" },
  { id: "notify", name: "Live Wire", desc: "Open the notification center.", xp: 20, target: 1, stat: "notifs" },
  { id: "profile", name: "Named", desc: "Set a custom username.", xp: 20, target: 1, stat: "named" },
  { id: "equip", name: "Fitted", desc: "Equip a cosmetic.", xp: 20, target: 1, stat: "equipped" },
  { id: "chat", name: "Open Mic", desc: "Send a friend message.", xp: 20, target: 1, stat: "messages" },
  { id: "weekend", name: "Weekend Ops", desc: "Play during weekend XP.", xp: 60, target: 1, stat: "weekend" },
];

export function dailyMissions(day: string) {
  const seed = [...day].reduce((a, c) => a + c.charCodeAt(0), 0);
  const pool = [
    { id: "play-any", name: "Play a match", desc: "Finish any game.", target: 1, xp: 40, stat: "matches" },
    { id: "play-3", name: "Triple session", desc: "Finish 3 matches.", target: 3, xp: 80, stat: "matches" },
    { id: "puzzle", name: "Cut gems", desc: "Clear a Puzzle Quest board.", target: 1, xp: 50, stat: "puzzle" },
    { id: "race", name: "Run a lap set", desc: "Finish Neon Circuit.", target: 1, xp: 60, stat: "races" },
    { id: "fps", name: "Five tags", desc: "Get 5 Vector Strike eliminations.", target: 5, xp: 70, stat: "kills" },
    { id: "fight", name: "Ring time", desc: "Win an Iron Ring bout.", target: 1, xp: 60, stat: "fight_wins" },
    { id: "memory", name: "Recall", desc: "Clear a Memory Flip board.", target: 1, xp: 50, stat: "memory" },
    { id: "rush", name: "Twenty gates", desc: "Score 20 in Color Rush.", target: 20, xp: 55, stat: "rush" },
    { id: "invite", name: "Bring a friend", desc: "Send a referral share.", target: 1, xp: 40, stat: "share" },
    { id: "login", name: "Show up", desc: "Collect the daily login.", target: 1, xp: 25, stat: "login" },
  ];
  const out = [];
  let i = seed % pool.length;
  const used = new Set<string>();
  while (out.length < 5) {
    const m = pool[i % pool.length];
    if (!used.has(m.id)) {
      used.add(m.id);
      out.push({ ...m, id: `${day}-${m.id}` });
    }
    i += 3;
  }
  return out;
}

export function currentGiveaway(d = new Date()) {
  const w = Math.floor(d.getTime() / (7 * 86400000));
  return GIVEAWAYS[w % GIVEAWAYS.length];
}

export function previousGiveaway(d = new Date()) {
  const w = Math.floor(d.getTime() / (7 * 86400000)) - 1;
  return GIVEAWAYS[((w % GIVEAWAYS.length) + GIVEAWAYS.length) % GIVEAWAYS.length];
}

export function weekEnd(d = new Date()) {
  const day = d.getUTCDay() || 7;
  const end = new Date(d);
  end.setUTCDate(d.getUTCDate() + (7 - day));
  end.setUTCHours(23, 59, 59, 0);
  return end;
}

export function isWeekendXp(d = new Date()) {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isHappyHour(d = new Date()) {
  const h = d.getHours();
  return h >= 19 && h < 21;
}

export function xpMultiplier(d = new Date()) {
  let m = 1;
  if (isWeekendXp(d)) m *= 1.5;
  if (isHappyHour(d)) m *= 2;
  return m;
}

export function avatarHue(id: string) {
  const n = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
  return n % 360;
}
