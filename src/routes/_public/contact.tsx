import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_public/contact")({ component: Contact });

function Contact() {
  const [sent, setSent] = useState(false);
  return (
    <Page>
      <PageTitle kicker="Ops" title="Contact" />
      <form
        className="max-w-md space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSent(true);
          toast.success("Message filed with ops.");
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required placeholder="you@studio.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="msg">Message</Label>
          <textarea
            id="msg"
            required
            rows={5}
            className="w-full rounded-[16px] border border-border bg-surface-2 px-3 py-2 text-sm"
          />
        </div>
        <Button type="submit" disabled={sent}>
          {sent ? "Sent" : "Send"}
        </Button>
      </form>
    </Page>
  );
}
