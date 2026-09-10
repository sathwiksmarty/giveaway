import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-bg px-4">
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-60" />
      <div className="relative w-full max-w-md rounded-[28px] border border-border bg-surface p-8 shadow-[var(--shadow-panel)]">
        <Link to="/" className="mb-8 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-[10px] bg-accent text-bg">
            <Gamepad2 className="size-4" />
          </span>
          <span className="font-display text-xl font-semibold tracking-[0.18em]">INSTANT</span>
        </Link>
        <h1 className="font-display text-4xl font-semibold">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          Google or X. Your rank, wallet, and drop eligibility follow the account.
        </p>
        <div className="mt-8 space-y-3">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button
                key={p.providerId}
                type="button"
                variant={p.idp === "google" ? "default" : "secondary"}
                className="w-full"
                onClick={() => signIn(p.providerId, { callbackURL: "/onboarding" })}
              >
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <p className="mt-6 text-xs text-subtle">
          By continuing you agree to the{" "}
          <Link to="/terms" className="text-fg underline-offset-4 hover:underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="text-fg underline-offset-4 hover:underline">
            Privacy
          </Link>{" "}
          policy.
        </p>
      </div>
    </main>
  );
}
