import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { getNotifications, markNotifications, unlockAchievement } from "@/lib/instant/api";
import { useQuery } from "@tanstack/react-query";
import { relativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export const Route = createFileRoute("/_app/notifications")({ component: Notes });

function Notes() {
  const q = useQuery({ queryKey: ["notes"], queryFn: () => getNotifications(), refetchInterval: 8000 });
  useEffect(() => {
    void unlockAchievement({ data: { id: "notify" } }).catch(() => undefined);
  }, []);
  return (
    <Page>
      <PageTitle
        kicker="Live"
        title="Notifications"
        action={
          <Button size="sm" variant="secondary" onClick={() => void markNotifications()}>
            Mark read
          </Button>
        }
      />
      <ul className="divide-y divide-border rounded-[24px] border border-border bg-surface">
        {(q.data ?? []).map((n) => (
          <li key={n.id} className="px-4 py-3">
            <div className="flex justify-between gap-3">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-sm text-muted">{n.body}</div>
              </div>
              <div className="text-xs text-subtle">{relativeTime(n.created_at)}</div>
            </div>
            {n.href ? (
              <Link to={n.href as "/dashboard"} className="text-xs text-accent">
                Open
              </Link>
            ) : null}
          </li>
        ))}
        {(q.data ?? []).length === 0 ? <li className="px-4 py-8 text-sm text-muted">Quiet for now.</li> : null}
      </ul>
    </Page>
  );
}
