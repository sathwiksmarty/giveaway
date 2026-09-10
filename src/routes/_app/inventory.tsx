import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { COSMETICS } from "@/lib/instant/catalog";
import { equipItem, getWallet } from "@/lib/instant/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/inventory")({ component: Inventory });

function Inventory() {
  const qc = useQueryClient();
  const w = useQuery({ queryKey: ["wallet"], queryFn: () => getWallet() });
  const eq = useMutation({
    mutationFn: (itemId: string) => equipItem({ data: { itemId } }),
    onSuccess: () => {
      toast.success("Equipped");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Page>
      <PageTitle kicker="Locker" title="Inventory" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(w.data?.items ?? []).map((i) => {
          const c = COSMETICS.find((x) => x.id === i.item_id);
          if (!c) return null;
          return (
            <article key={i.item_id} className="rounded-[20px] border border-border bg-surface p-4">
              <Badge className={`rarity-${c.rarity}`}>{c.rarity}</Badge>
              <h3 className="mt-3 font-display text-xl">{c.name}</h3>
              <p className="text-xs text-muted">{c.kind}</p>
              <Button className="mt-4" size="sm" variant={i.equipped ? "gold" : "secondary"} onClick={() => eq.mutate(c.id)}>
                {i.equipped ? "Equipped" : "Equip"}
              </Button>
            </article>
          );
        })}
      </div>
      {(w.data?.items ?? []).length === 0 ? <p className="text-sm text-muted">Buy a drop in the store.</p> : null}
    </Page>
  );
}
