import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { PAYMENT_METHODS, SKUS } from "@/lib/instant/catalog";
import { Button } from "@/components/ui/button";
import { checkout, getMe, getWallet } from "@/lib/instant/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatInr, relativeTime } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Search = { sku?: string };

export const Route = createFileRoute("/_app/wallet")({
  validateSearch: (s: Record<string, unknown>): Search => ({ sku: typeof s.sku === "string" ? s.sku : undefined }),
  component: Wallet,
});

function Wallet() {
  const { sku: qsku } = Route.useSearch();
  const [sku, setSku] = useState(qsku ?? "xp-boost-9");
  const [method, setMethod] = useState("upi");
  const qc = useQueryClient();
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const w = useQuery({ queryKey: ["wallet"], queryFn: () => getWallet() });
  const pay = useMutation({
    mutationFn: () => checkout({ data: { sku, method } }),
    onSuccess: (r) => {
      if (r.boostUntil) sessionStorage.setItem("instant.boost", String(r.boostUntil));
      toast.success("Payment confirmed");
      void qc.invalidateQueries();
    },
    onError: (e: Error) => toast.error(e.message),
  });
  const selected = SKUS.find((s) => s.id === sku) ?? SKUS[0];

  return (
    <Page>
      <PageTitle kicker="Treasury" title="Wallet" />
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-border bg-surface p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-muted">XP</div>
              <div className="font-display text-4xl tabular-nums">{me.data?.xp ?? 0}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.16em] text-muted">Coins</div>
              <div className="font-display text-4xl tabular-nums text-gold">{me.data?.coins ?? 0}</div>
            </div>
          </div>
          <h2 className="mt-8 font-display text-xl">Checkout</h2>
          <div className="mt-3 space-y-2">
            {SKUS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSku(s.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-[14px] border px-3 py-3 text-left text-sm",
                  sku === s.id ? "border-accent bg-surface-2" : "border-border",
                )}
              >
                <span>
                  {s.name}
                  <span className="block text-xs text-muted">{s.blurb}</span>
                </span>
                <span className="tabular-nums">{formatInr(s.paise)}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={cn(
                  "h-11 rounded-[12px] border text-sm",
                  method === m.id ? "border-gold text-gold" : "border-border text-muted",
                )}
              >
                {m.name}
              </button>
            ))}
          </div>
          <Button className="mt-6 w-full" onClick={() => pay.mutate()} disabled={pay.isPending}>
            Pay {formatInr(selected.paise)} via {PAYMENT_METHODS.find((m) => m.id === method)?.name}
          </Button>
          <p className="mt-3 text-xs text-subtle">
            Sandbox checkout records the purchase on your account. Production wires Razorpay webhooks the same way.
          </p>
        </section>
        <section className="rounded-[24px] border border-border bg-surface p-6">
          <h2 className="font-display text-xl">History</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(w.data?.purchases ?? []).map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>
                  {p.sku}
                  <span className="block text-xs text-muted">
                    {p.method} · {relativeTime(p.created_at)}
                  </span>
                </span>
                <span className="tabular-nums">{formatInr(p.amount_paise)}</span>
              </li>
            ))}
            {(w.data?.ledger ?? []).slice(0, 8).map((l) => (
              <li key={`x${l.id}`} className="flex justify-between text-muted">
                <span>{l.reason}</span>
                <span className="tabular-nums text-gold">+{l.amount} XP</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Page>
  );
}
