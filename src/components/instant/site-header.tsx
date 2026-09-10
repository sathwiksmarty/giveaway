import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Bell, Gamepad2, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const links = [
  { to: "/play", label: "Play" },
  { to: "/giveaways", label: "Giveaways" },
  { to: "/leaderboard", label: "Ranks" },
  { to: "/store", label: "Store" },
];

export function SiteHeader({ solid = false }: { solid?: boolean }) {
  const { user, isPending } = useCurrentUserState();
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-border/80",
        solid ? "bg-bg" : "bg-bg/80 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-[10px] bg-accent text-bg">
            <Gamepad2 className="size-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-[0.18em]">INSTANT</span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-muted transition-colors duration-150 hover:text-fg"
              activeProps={{ className: "text-fg" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/leaderboard"
            className="hidden size-11 place-items-center rounded-[12px] text-muted hover:text-fg md:grid"
            aria-label="Ranks"
          >
            <Trophy className="size-4" />
          </Link>
          {isPending ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-surface-2" />
          ) : user ? (
            <SignedIn>
              <Link
                to="/notifications"
                className="grid size-11 place-items-center rounded-[12px] text-muted hover:text-fg"
                aria-label="Notifications"
              >
                <Bell className="size-4" />
              </Link>
              <Link to="/dashboard" className="hidden sm:block">
                <Button size="sm" variant="secondary">
                  Command
                </Button>
              </Link>
              <div className="max-w-[160px] truncate text-sm">
                <UserButton />
              </div>
            </SignedIn>
          ) : (
            <SignedOut>
              <Link to="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            </SignedOut>
          )}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-bg">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div>
          <div className="font-display text-lg font-semibold tracking-[0.18em]">INSTANT</div>
          <p className="mt-2 max-w-xs text-sm text-muted">
            Free-to-play. Rank up. Win the drop.
          </p>
        </div>
        {[
          {
            h: "Play",
            items: [
              ["/play", "Lobby"],
              ["/giveaways", "Giveaways"],
              ["/leaderboard", "Leaderboard"],
              ["/store", "Store"],
            ],
          },
          {
            h: "House",
            items: [
              ["/about", "About"],
              ["/faq", "FAQ"],
              ["/winners", "Winners"],
              ["/careers", "Careers"],
              ["/contact", "Contact"],
            ],
          },
          {
            h: "Legal",
            items: [
              ["/terms", "Terms"],
              ["/privacy", "Privacy"],
            ],
          },
        ].map((col) => (
          <div key={col.h}>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted">{col.h}</div>
            <ul className="mt-3 space-y-2">
              {col.items.map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-sm text-fg/80 hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
