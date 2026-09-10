import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { getFriends, getMessages, sendMessage } from "@/lib/instant/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";
import { useCurrentUser } from "@/lib/auth/use-current-user";

type Search = { with?: string };
export const Route = createFileRoute("/_app/chat")({
  validateSearch: (s: Record<string, unknown>): Search => ({ with: typeof s.with === "string" ? s.with : undefined }),
  component: Chat,
});

function Chat() {
  const { with: withId } = Route.useSearch();
  const user = useCurrentUser();
  const friends = useQuery({ queryKey: ["friends"], queryFn: () => getFriends() });
  const peer = withId ?? friends.data?.rows.find((r) => r.status === "accepted")?.friend_id;
  const msgs = useQuery({
    queryKey: ["msgs", peer],
    queryFn: () => getMessages({ data: { withId: peer! } }),
    enabled: !!peer,
    refetchInterval: 2500,
  });
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const qc = useQueryClient();
  const send = useMutation({
    mutationFn: () => sendMessage({ data: { toId: peer!, body: text } }),
    onSuccess: () => {
      setText("");
      void qc.invalidateQueries({ queryKey: ["msgs", peer] });
    },
  });
  const name = useMemo(
    () => friends.data?.rows.find((r) => r.friend_id === peer)?.display_name ?? "Friend",
    [friends.data, peer],
  );

  return (
    <Page>
      <PageTitle kicker="Party line" title={name} />
      <div className="flex h-[60vh] flex-col rounded-[24px] border border-border bg-surface">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {(msgs.data ?? []).map((m) => (
            <div
              key={m.id}
              className={m.from_id === user?.id ? "ml-auto max-w-[80%] rounded-[16px] bg-accent px-3 py-2 text-sm text-bg" : "max-w-[80%] rounded-[16px] bg-surface-2 px-3 py-2 text-sm"}
            >
              {m.body}
            </div>
          ))}
          {typing ? <div className="text-xs text-muted">Typing…</div> : null}
        </div>
        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (peer && text.trim()) send.mutate();
          }}
        >
          <Input
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setTyping(true);
              setTimeout(() => setTyping(false), 800);
            }}
            placeholder="Message"
          />
          <Button type="submit" disabled={!peer}>
            Send
          </Button>
        </form>
      </div>
    </Page>
  );
}
