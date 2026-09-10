import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { BATTLE_PASS, BP_XP_PER_LEVEL } from "@/lib/instant/catalog";
import { getMe } from "@/lib/instant/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/battle-pass")({ component: Pass });

function Pass() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const xp = me.data?.battle_pass_xp ?? 0;
  const level = Math.min(100, Math.floor(xp / BP_XP_PER_LEVEL) + 1);
  const into = xp % BP_XP_PER_LEVEL;
  return (
    <Page>
      <PageTitle
        kicker="Season 01"
        title="Battle Pass"
        action={
          me.data?.battle_pass_premium ? (
            <span className="text-gold">Premium</span>
          ) : (
            <Link to="/wallet" search={{ sku: "battle-pass" }}>
              <Button>Unlock premium</Button>
            </Link>
          )
        }
      />
      <div className="mb-6 rounded-[20px] border border-border bg-surface p-5">
        <div className="flex justify-between text-sm">
          <span>Level {level}</span>
          <span className="tabular-nums text-muted">
            {into}/{BP_XP_PER_LEVEL}
          </span>
        </div>
        <Progress className="mt-2" value={(into / BP_XP_PER_LEVEL) * 100} />
      </div>
      <div className="space-y-2">
        {BATTLE_PASS.map((row) => (
          <div
            key={row.level}
            className={cn(
              "grid grid-cols-[48px_1fr_1fr] items-center gap-3 rounded-[14px] border border-border px-3 py-2 text-sm",
              row.level <= level && "border-accent/30 bg-surface",
            )}
          >
            <span className="tabular-nums text-muted">{row.level}</span>
            <span>{row.free}</span>
            <span className="text-gold">{row.premium}</span>
          </div>
        ))}
      </div>
    </Page>
  );
}
