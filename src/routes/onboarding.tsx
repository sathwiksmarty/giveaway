import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RequireUser } from "@/components/instant/require-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AVATARS } from "@/lib/instant/catalog";
import { PlayerAvatar } from "@/components/instant/avatar";
import { ensureProfile, updateProfile } from "@/lib/instant/api";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

function Onboarding() {
  return (
    <RequireUser>
      <Form />
    </RequireUser>
  );
}

function Form() {
  const user = useCurrentUser();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [display, setDisplay] = useState(user?.displayName ?? "");
  const [avatar, setAvatar] = useState("a1");
  const [referral, setReferral] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    ensureProfile({ data: { displayName: user?.displayName ?? undefined } }).catch(() => undefined);
  }, [user]);

  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-4">
      <form
        className="w-full max-w-md rounded-[28px] border border-border bg-surface p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          try {
            await updateProfile({
              data: { username, displayName: display, avatarId: avatar, referral: referral || undefined },
            });
            toast.success("Callsign locked.");
            void nav({ to: "/dashboard" });
          } catch (err) {
            toast.error(err instanceof Error ? err.message : "Could not save");
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="text-xs uppercase tracking-[0.16em] text-muted">Operator setup</div>
        <h1 className="mt-2 font-display text-4xl font-semibold">Name the seat</h1>
        <div className="mt-6 space-y-2">
          <Label htmlFor="user">Username</Label>
          <Input id="user" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} />
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="disp">Display name</Label>
          <Input id="disp" value={display} onChange={(e) => setDisplay(e.target.value)} required />
        </div>
        <div className="mt-4 space-y-2">
          <Label>Avatar</Label>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((id) => (
              <button key={id} type="button" onClick={() => setAvatar(id)} className="rounded-full">
                <PlayerAvatar
                  id={id + username}
                  name={display || "P"}
                  size={44}
                  className={avatar === id ? "ring-2 ring-accent" : ""}
                />
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Label htmlFor="ref">Referral code</Label>
          <Input id="ref" value={referral} onChange={(e) => setReferral(e.target.value)} placeholder="Optional" />
        </div>
        <Button type="submit" className="mt-8 w-full" disabled={busy}>
          Enter INSTANT
        </Button>
      </form>
    </main>
  );
}
