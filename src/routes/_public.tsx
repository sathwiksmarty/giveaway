import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "@/components/instant/site-header";

export const Route = createFileRoute("/_public")({ component: PublicLayout });

function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      <SiteHeader />
      <div className="flex-1">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  );
}
