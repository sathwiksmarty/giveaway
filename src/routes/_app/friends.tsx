import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { friendAction, getFriends } from "@/lib/instant/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlayerAvatar } from "@/components/instant/avatar";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/friends")({ component: Friends });

function Friends() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["friends"], queryFn: () => getFriends() });
  const [name, setName] = useState("");
  const act = useMutation({
    mutationFn: (input: { username?: string; userId?: string; action: "add" | "accept" | "remove" }) =>
      friendAction({ data: input }),
    onSuccess: () => {
      toast.success("Updated");
      void qc.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Page>
      <PageTitle kicker="Squad" title="Friends" />
      <form
        className="mb-8 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          act.mutate({ username: name, action: "add" });
        }}
      >
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Username" />
        <Button type="submit">Add</Button>
      </form>
      {(q.data?.incoming ?? []).length ? (
        <section className="mb-6">
          <h2 className="font-display text-xl">Requests</h2>
          <ul className="mt-3 space-y-2">
            {q.data?.incoming.map((r) => (
              <li key={r.user_id} className="flex items-center justify-between rounded-[16px] border border-border p-3">
                <span className="flex items-center gap-3">
                  <PlayerAvatar id={r.user_id} name={r.display_name} size={32} />
                  {r.display_name}
                </span>
                <Button size="sm" onClick={() => act.mutate({ userId: r.user_id, action: "accept" })}>
                  Accept
                </Button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ul className="space-y-2">
        {(q.data?.rows ?? [])
          .filter((r) => r.status === "accepted")
          .map((r) => (
            <li key={r.friend_id} className="flex items-center justify-between rounded-[16px] border border-border p-3">
              <span className="flex items-center gap-3">
                <PlayerAvatar id={r.friend_id} name={r.display_name} size={32} />
                <span>
                  {r.display_name}
                  <span className="block text-xs text-muted">Lv {r.level}</span>
                </span>
              </span>
              <Link to="/chat" search={{ with: r.friend_id }} className="text-sm text-accent">
                Chat
              </Link>
            </li>
          ))}
      </ul>
    </Page>
  );
}
