import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "default" | "gold" | "accent" | "success" | "danger" }) {
  const tones = {
    default: "border-border text-muted",
    gold: "border-gold/40 text-gold",
    accent: "border-accent/40 text-accent",
    success: "border-success/40 text-success",
    danger: "border-destructive/40 text-destructive",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-[0.14em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
