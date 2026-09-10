import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { getMe, getReferrals } from "@/lib/instant/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/referrals")({ component: Referrals });

function Referrals() {
  const me = useQuery({ queryKey: ["me"], queryFn: () => getMe() });
  const refs = useQuery({ queryKey: ["refs"], queryFn: () => getReferrals() });
  const [qr, setQr] = useState("");
  const code = me.data?.referral_code ?? "";
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/login?ref=${code}`;

  useEffect(() => {
    if (!code) return;
    QRCode.toDataURL(link, { margin: 1, width: 280, color: { dark: "#07080d", light: "#eef0f6" } }).then(setQr);
  }, [code, link]);

  const qualified = (refs.data ?? []).filter((r) => r.qualified).length;

  return (
    <Page>
      <PageTitle kicker="Recruit" title="Referral center" />
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-[24px] border border-border bg-surface p-6">
          <div className="text-xs uppercase tracking-[0.16em] text-muted">Your code</div>
          <div className="mt-2 font-display text-4xl tracking-[0.12em]">{code || "—"}</div>
          <p className="mt-2 text-sm text-muted">XP lands after your friend signs in and finishes a qualifying match.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(link);
                toast.success("Link copied");
              }}
            >
              Copy link
            </Button>
            <a
              className="inline-flex h-9 items-center rounded-[10px] border border-border px-3 text-sm"
              href={`https://wa.me/?text=${encodeURIComponent("Play INSTANT with my code " + code + " " + link)}`}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp
            </a>
          </div>
          {qr ? <img src={qr} alt="Referral QR" className="mt-6 w-40 rounded-[12px]" /> : null}
        </section>
        <section className="rounded-[24px] border border-border bg-surface p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-muted">Recruits</div>
              <div className="font-display text-3xl tabular-nums">{refs.data?.length ?? 0}</div>
            </div>
            <div>
              <div className="text-xs text-muted">Qualified</div>
              <div className="font-display text-3xl tabular-nums text-gold">{qualified}</div>
            </div>
          </div>
          <ul className="mt-6 space-y-2 text-sm">
            {(refs.data ?? []).map((r) => (
              <li key={r.referee_id} className="flex justify-between">
                <span>{r.display_name}</span>
                <span className={r.qualified ? "text-success" : "text-muted"}>
                  {r.qualified ? "Qualified" : "Pending play"}
                </span>
              </li>
            ))}
            {(refs.data ?? []).length === 0 ? <li className="text-muted">No recruits yet.</li> : null}
          </ul>
        </section>
      </div>
    </Page>
  );
}
