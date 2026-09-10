import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { adminAct, getAdminSnapshot } from "@/lib/instant/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { formatInr, relativeTime } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/admin")({ component: Admin });

const tabs = ["overview", "users", "giveaways", "games", "xp", "cosmetics", "reports", "fraud"] as const;

function Admin() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("overview");
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin"], queryFn: () => getAdminSnapshot() });
  const act = useMutation({
    mutationFn: (input: { action: "ban" | "unban"; userId: string }) => adminAct({ data: input }),
    onSuccess: () => {
      toast.success("Updated");
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  if (q.error) {
    return (
      <Page>
        <PageTitle title="Ops" />
        <p className="text-sm text-muted">Restricted. First account on a fresh database is promoted automatically.</p>
      </Page>
    );
  }
  const d = q.data;
  return (
    <Page>
      <PageTitle kicker="Restricted" title="Ops console" />
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "h-10 rounded-full border px-3 text-sm capitalize",
              tab === t ? "border-gold text-gold" : "border-border text-muted",
            )}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "overview" && d ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card k="DAU" v={String(d.dau)} />
          <Card k="MAU" v={String(d.mau)} />
          <Card k="Players" v={String(d.users.length)} />
          <Card k="Revenue" v={formatInr(d.revenue.sum)} />
        </div>
      ) : null}
      {tab === "users" && d ? (
        <ul className="divide-y divide-border rounded-[20px] border border-border bg-surface">
          {d.users.map((u) => (
            <li key={u.user_id} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>
                {u.display_name}
                <span className="ml-2 text-xs text-muted">@{u.username}</span>
              </span>
              <Button
                size="sm"
                variant={u.banned ? "secondary" : "danger"}
                onClick={() => act.mutate({ action: u.banned ? "unban" : "ban", userId: u.user_id })}
              >
                {u.banned ? "Unban" : "Ban"}
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "games" && d ? (
        <ul className="space-y-2">
          {d.games.map((g) => (
            <li key={g.game_id} className="flex justify-between rounded-[16px] border border-border px-4 py-3 text-sm">
              <span className="capitalize">{g.game_id.replace("-", " ")}</span>
              <span className="tabular-nums">{g.n} sessions</span>
            </li>
          ))}
        </ul>
      ) : null}
      {tab === "fraud" && d ? (
        <ul className="space-y-2 text-sm">
          {d.alerts.map((a) => (
            <li key={a.id} className="rounded-[16px] border border-destructive/30 bg-surface p-3">
              <div className="font-medium">{a.kind}</div>
              <div className="text-muted">{a.detail}</div>
              <div className="text-xs text-subtle">{relativeTime(a.created_at)}</div>
            </li>
          ))}
          {d.alerts.length === 0 ? <li className="text-muted">No alerts.</li> : null}
        </ul>
      ) : null}
      {tab === "reports" && d ? (
        <ul className="space-y-2 text-sm">
          {d.reports.map((r) => (
            <li key={r.id} className="rounded-[16px] border border-border p-3">
              {r.reason} · {r.status}
            </li>
          ))}
          {d.reports.length === 0 ? <li className="text-muted">No reports.</li> : null}
        </ul>
      ) : null}
      {["giveaways", "xp", "cosmetics"].includes(tab) ? (
        <p className="text-sm text-muted">
          Live giveaways, XP events, and cosmetics are catalog-driven. Ban/fraud tools sit under Users and Fraud.
        </p>
      ) : null}
    </Page>
  );
}

function Card({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-[20px] border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-[0.14em] text-muted">{k}</div>
      <div className="font-display text-3xl tabular-nums">{v}</div>
    </div>
  );
}
