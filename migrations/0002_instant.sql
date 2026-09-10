-- INSTANT core schema. user_id is TEXT (Better Auth ids / 'dev-user').

create table if not exists profiles (
  user_id text primary key,
  username text not null unique,
  display_name text not null,
  avatar_id text not null default 'a1',
  title_id text,
  frame_id text,
  badge_id text,
  equipped_car text,
  equipped_weapon text,
  equipped_fighter text,
  referral_code text not null unique,
  referred_by text,
  xp integer not null default 0,
  coins integer not null default 0,
  level integer not null default 1,
  streak_days integer not null default 0,
  last_login_date date,
  battle_pass_xp integer not null default 0,
  battle_pass_premium boolean not null default false,
  is_admin boolean not null default false,
  banned boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists profiles_xp_idx on profiles (xp desc);
create index if not exists profiles_referral_idx on profiles (referral_code);

create table if not exists xp_ledger (
  id serial primary key,
  user_id text not null,
  amount integer not null,
  reason text not null,
  game_id text,
  created_at timestamptz not null default now()
);
create index if not exists xp_ledger_user_idx on xp_ledger (user_id, created_at desc);

create table if not exists scores (
  id serial primary key,
  user_id text not null,
  game_id text not null,
  score integer not null,
  xp_awarded integer not null,
  duration_ms integer not null default 0,
  meta text,
  created_at timestamptz not null default now()
);
create index if not exists scores_user_game_idx on scores (user_id, game_id, created_at desc);
create index if not exists scores_game_score_idx on scores (game_id, score desc);

create table if not exists inventory (
  id serial primary key,
  user_id text not null,
  item_id text not null,
  equipped boolean not null default false,
  acquired_at timestamptz not null default now(),
  unique (user_id, item_id)
);
create index if not exists inventory_user_idx on inventory (user_id);

create table if not exists friends (
  user_id text not null,
  friend_id text not null,
  status text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, friend_id)
);
create index if not exists friends_friend_idx on friends (friend_id);

create table if not exists messages (
  id serial primary key,
  from_id text not null,
  to_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_pair_idx on messages (from_id, to_id, created_at);

create table if not exists notifications (
  id serial primary key,
  user_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on notifications (user_id, created_at desc);

create table if not exists purchases (
  id serial primary key,
  user_id text not null,
  sku text not null,
  amount_paise integer not null,
  method text not null,
  status text not null,
  created_at timestamptz not null default now()
);
create index if not exists purchases_user_idx on purchases (user_id, created_at desc);

create table if not exists mission_progress (
  user_id text not null,
  mission_id text not null,
  day date not null,
  progress integer not null default 0,
  claimed boolean not null default false,
  primary key (user_id, mission_id, day)
);

create table if not exists achievement_unlocks (
  user_id text not null,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create table if not exists referrals (
  referrer_id text not null,
  referee_id text not null unique,
  qualified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reports (
  id serial primary key,
  reporter_id text not null,
  target_id text not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists fraud_alerts (
  id serial primary key,
  user_id text not null,
  kind text not null,
  detail text not null,
  created_at timestamptz not null default now()
);

create table if not exists giveaway_winners (
  id serial primary key,
  giveaway_id text not null,
  user_id text not null,
  place integer not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists rivals (
  id text primary key,
  username text not null,
  display_name text not null,
  xp integer not null,
  weekly_xp integer not null,
  monthly_xp integer not null,
  level integer not null,
  title text not null
);

insert into rivals (id, username, display_name, xp, weekly_xp, monthly_xp, level, title) values
  ('r1', 'apexnova', 'Apex Nova', 184200, 4200, 18800, 62, 'Circuit Phantom'),
  ('r2', 'kairo', 'Kairo Vex', 171400, 3900, 16400, 58, 'Iron Saint'),
  ('r3', 'lyrawave', 'Lyra Wave', 165900, 5100, 20100, 56, 'Pulse Dancer'),
  ('r4', 'northline', 'Northline', 152000, 2800, 14200, 52, 'Drift Baron'),
  ('r5', 'unitzero', 'UNIT-0', 148800, 3300, 13900, 51, 'Chrome Warden'),
  ('r6', 'sable', 'Sable Ryn', 141200, 4600, 17600, 49, 'Night Operator'),
  ('r7', 'goldthread', 'Goldthread', 133500, 2100, 12100, 47, 'Vault Keeper'),
  ('r8', 'mira', 'Mira Sol', 129800, 3700, 15400, 46, 'Sunwire'),
  ('r9', 'hexlane', 'Hexlane', 121000, 1900, 9800, 44, 'Grid Ghost'),
  ('r10', 'voss', 'Kade Voss', 118400, 2500, 11200, 43, 'Office Legend'),
  ('r11', 'ion', 'Ion Park', 109900, 3200, 13100, 41, 'Volt Runner'),
  ('r12', 'nori', 'Nori Hale', 104200, 1800, 8700, 39, 'Quiet Blade'),
  ('r13', 'ember', 'Ember Cox', 98000, 2700, 10200, 38, 'Forge Hand'),
  ('r14', 'quill', 'Quill Aden', 91000, 1400, 7600, 36, 'Paper Tiger'),
  ('r15', 'dusk', 'Dusk Arden', 86400, 2200, 9100, 35, 'Low Orbit'),
  ('r16', 'reef', 'Reef Tanaka', 79200, 1600, 6800, 33, 'Tide Tuner'),
  ('r17', 'opal', 'Opal Wren', 73100, 2400, 8900, 31, 'Glass Queen'),
  ('r18', 'brick', 'Brick Lang', 68800, 1100, 5400, 30, 'Street Anchor'),
  ('r19', 'nyx', 'Nyx Calder', 61200, 2900, 10100, 28, 'Void Spark'),
  ('r20', 'halo', 'Halo Mint', 55400, 1300, 4900, 26, 'First Light')
on conflict (id) do nothing;
