import { createFileRoute } from "@tanstack/react-router";
import { Page, PageTitle } from "@/components/instant/page";
import { FAQS } from "@/lib/instant/catalog";

export const Route = createFileRoute("/_public/faq")({ component: Faq });

function Faq() {
  return (
    <Page>
      <PageTitle kicker="Help" title="FAQ" />
      <div className="max-w-2xl divide-y divide-border border-y border-border">
        {FAQS.map((f) => (
          <details key={f.q} className="py-4">
            <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
            <p className="mt-2 text-sm text-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </Page>
  );
}
