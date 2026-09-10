import { Link, Outlet } from "@tanstack/react-router";
import {
  Bell,
  Gamepad2,
  Gift,
  LayoutGrid,
  Medal,
  Settings,
  ShoppingBag,
  Swords,
  Trophy,
  Users,
  Wallet,
  Shield,
} from "lucide-react";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { ensureProfile, getMe, type Profile } from "@/lib/instant/api";
import { PlayerAvatar } from "./avatar";
import { formatXp, levelProgress } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Command", icon: LayoutGrid },
  { to: "/play", label: "Lobby", icon: Gamepad2 },
  { to: "/giveaways", label: "Giveaways", icon: Gift },
  { to: "/leaderboard", label: "Ranks", icon: Trophy },
  { to: "/store", label: "Store", icon: ShoppingBag },
  { to: "/battle-pass", label: "Season", icon: Medal },
  { to: "/missions", label: "Missions", icon: Swords },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/friends", label: "Friends", icon: Users },
  { to: "/notifications", label: "Inbox", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppShell() {
  const { user } = useCurrentUserState();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) return;
    ensureProfile({ data: { displayName: user.displayName ?? undefined, image: user.profileImageUrl } })
      .then((p) => setProfile(p))
      .catch(() => getMe().then(setProfile).catch(() => setProfile(null)));
  }, [user]);

  const lp = levelProgress(profile?.xp ?? 0);

  return (
    <div className="min-h-dvh bg-bg text-fg md:grid md:grid-cols-[220px_1fr]">
      <aside className="hidden border-r border-border md:flex md:flex-col">
        <Link to="/" className="flex h-16 items-center gap-2 px-4">
          <span className="grid size-8 place-items-center rounded-[10px] bg-accent text-bg">
            <Gamepad2 className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-[0.18em]">INSTANT</span>
        </Link>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-2">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex h-11 items-center gap-3 rounded-[12px] px-3 text-sm text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-fg"
              activeProps={{ className: "bg-surface-2 text-fg" }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
          {profile?.is_admin ? (
            <Link
              to="/admin"
              className="flex h-11 items-center gap-3 rounded-[12px] px-3 text-sm text-gold hover:bg-surface-2"
              activeProps={{ className: "bg-surface-2" }}
            >
              <Shield className="size-4" />
              Ops
            </Link>
          ) : null}
        </nav>
        <div className="border-t border-border p-3">
          {profile ? (
            <Link to="/profile" className="flex items-center gap-3 rounded-[12px] p-2 hover:bg-surface-2">
              <PlayerAvatar id={profile.user_id} name={profile.display_name} size={36} />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{profile.display_name}</div>
                <div className="text-xs text-muted tabular-nums">
                  Lv {lp.level} · {formatXp(profile.xp)} XP
                </div>
              </div>
            </Link>
          ) : (
            <div className="h-12 animate-pulse rounded-[12px] bg-surface-2" />
          )}
        </div>
      </aside>
      <div className="flex min-w-0 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
          <div className="text-sm text-muted">Live season</div>
          <div className={cn("flex items-center gap-3")}>
            <UserButton />
          </div>
        </div>
        <div className="min-h-0 flex-1">
          <Outlet />
        </div>
        <nav className="grid grid-cols-5 border-t border-border md:hidden">
          {nav.slice(0, 5).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em] text-muted"
              activeProps={{ className: "text-fg" }}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
