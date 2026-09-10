import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[12px] border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-subtle",
        "transition-[border-color,box-shadow] duration-150",
        "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/30",
        className,
      )}
      {...props}
    />
  );
}
