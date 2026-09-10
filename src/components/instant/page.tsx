import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10", className)}>
      {children}
    </div>
  );
}

export function PageTitle({
  kicker,
  title,
  action,
}: {
  kicker?: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {kicker ? (
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted">{kicker}</div>
        ) : null}
        <h1 className="mt-1 font-display text-4xl font-semibold md:text-5xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}
