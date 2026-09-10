# INSTANT

Free-to-play gaming giveaway platform. Play original games, earn XP, climb the live board, win the weekly drop.

## Product

- Google / X sign-in
- Six playable titles (puzzle, memory, color rush, racing, FPS, fighting)
- Server-authoritative XP, anti-cheat caps, referral qualification after real play
- Weekly giveaways from the live leaderboard
- Cosmetic store, Season Pass, wallet checkout (UPI / GPay / PhonePe / card)
- Friends, chat, missions, 50+ achievements, ops console

## Stack

TanStack Start, React 19, Tailwind v4, Postgres (Neon in production, PGLite in preview), Better Auth, Three.js.

## Scripts

```sh
npm install
npm run dev
npm run build
npm run typecheck
```

The app binds to port 8080 in development.

## Auth & data

Sign-in is on. Schema lives in `migrations/`. Per-user writes go through `authMiddleware` and `context.userId`. Never send a client user id.

## Payments

Checkout records SKU, method, and amount on the signed-in wallet. Wire a Razorpay order + webhook in production by swapping `checkout` in `src/lib/instant/api.ts` — keep signature verification on the server.

## Games

Routes: `/play` lobby, `/play/$gameId` fullscreen.

| Id | Title |
| --- | --- |
| puzzle-quest | Puzzle Quest |
| memory-flip | Memory Flip |
| color-rush | Color Rush |
| neon-circuit | Neon Circuit |
| vector-strike | Vector Strike |
| iron-ring | Iron Ring |

Racing exposes `window.__controlsTest` in-session (W gas, A left, D right).
