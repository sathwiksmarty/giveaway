import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/instant/app-shell";
import { RequireUser } from "@/components/instant/require-user";

export const Route = createFileRoute("/_app")({ component: AppLayout });

function AppLayout() {
  return (
    <RequireUser>
      <AppShell />
    </RequireUser>
  );
}
