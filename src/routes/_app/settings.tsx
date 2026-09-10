import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { getMe, updateProfile } from "@/lib/instant/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { UserButton } from "@/lib/auth/gates";

export const Route = createFileRoute("/_app/settings")({ component: Settings });

function Settings() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const [username, setUsername] = useState("");
  const [display, setDisplay] = useState("");
  return (
    <Page>
      <PageTitle kicker="Account" title="Settings" />
      <form
        className="max-w-md space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            await updateProfile({
              data: {
                username: username || me.data?.username,
                displayName: display || me.data?.display_name,
              },
            });
            toast.success("Saved");
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Failed");
          }
        }}
      >
        <div className="space-y-2">
          <Label>Username</Label>
          <Input
            defaultValue={me.data?.username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={me.data?.username}
          />
        </div>
        <div className="space-y-2">
          <Label>Display name</Label>
          <Input
            defaultValue={me.data?.display_name}
            onChange={(e) => setDisplay(e.target.value)}
            placeholder={me.data?.display_name}
          />
        </div>
        <Button type="submit">Save</Button>
      </form>
      <div className="mt-10">
        <div className="text-xs uppercase tracking-[0.16em] text-muted">Session</div>
        <div className="mt-3">
          <UserButton />
        </div>
      </div>
    </Page>
  );
}
