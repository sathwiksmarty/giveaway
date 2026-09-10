import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { COSMETICS, SKUS, type CosmeticKind } from "@/lib/instant/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buyCosmetic, getMe, getWallet } from "@/lib/instant/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatInr } from "@/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/store")({ component: Store });

const kinds: CosmeticKind[] = ["car", "weapon", "character", "emoji", "frame", "badge", "title"];

function Store() {
  const [kind, setKind] = useState<CosmeticKind | "all">("all");
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const wallet = useQuery({ queryKey: ["wallet"], queryFn: () => getWallet() });
  const owned = new Set((wallet.data?.items ?? []).map((i) => i.item_id));
  const buy = useMutation({
    mutationFn: (itemId: string) => buyCosmetic({ data: { itemId } }),
    onSuccess: () => {
      toast.success("Unlocked");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const items = COSMETICS.filter((c) => kind === "all" || c.kind === kind);

  return (
    <Page>
      <PageTitle
        kicker="Armory"
        title="Cosmetic store"
        action={<div className="text-sm tabular-nums text-gold">{me.data?.coins ?? 0} coins</div>}
      />
      <div className="mb-8 grid gap-3 md:grid-cols-5">
        {SKUS.map((s) => (
          <Link
            key={s.id}
            to="/wallet"
            search={{ sku: s.id }}
            className="rounded-[20px] border border-border bg-surface p-4 hover:border-gold/40"
          >
            <div className="text-xs uppercase tracking-[0.14em] text-muted">{s.name}</div>
            <div className="mt-1 font-display text-2xl">{formatInr(s.paise)}</div>
            <p className="mt-1 text-xs text-muted">{s.blurb}</p>
          </Link>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", ...kinds] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={cn(
              "h-10 rounded-full border px-3 text-sm capitalize",
              kind === k ? "border-accent bg-surface-2" : "border-border text-muted",
            )}
          >
            {k}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((c) => (
          <article key={c.id} className="rounded-[20px] border border-border bg-surface p-4">
            <Badge className={`rarity-${c.rarity}`}>{c.rarity}</Badge>
            <h3 className="mt-3 font-display text-xl">{c.name}</h3>
            <p className="mt-1 text-xs text-muted">{c.blurb}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="tabular-nums text-gold">{c.priceCoins}</span>
              {owned.has(c.id) ? (
                <span className="text-xs text-muted">Owned</span>
              ) : (
                <Button size="sm" onClick={() => buy.mutate(c.id)}>
                  Buy
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </Page>
  );
}
