import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[opacity,transform,background-color,border-color,color] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:not-disabled:scale-[0.96] [&_svg]:size-4",
  {
    variants: {
      variant: {
        default: "bg-accent text-primary-foreground hover:opacity-90",
        gold: "bg-gold text-bg hover:opacity-90",
        secondary:
          "bg-surface-2 text-fg border border-border hover:border-accent/40",
        ghost: "bg-transparent text-fg hover:bg-surface-2",
        outline: "border border-border bg-transparent hover:bg-surface-2",
        danger: "bg-destructive text-fg hover:opacity-90",
        link: "text-accent underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-4 rounded-[12px] text-sm",
        sm: "h-9 px-3 rounded-[10px] text-sm",
        lg: "h-12 px-5 rounded-[14px] text-base",
        icon: "size-11 rounded-[12px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
