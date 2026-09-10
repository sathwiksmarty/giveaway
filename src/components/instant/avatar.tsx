import { cn } from "@/lib/utils";
import { avatarHue } from "@/lib/instant/catalog";

export function PlayerAvatar({
  id,
  name,
  size = 40,
  className,
}: {
  id: string;
  name: string;
  size?: number;
  className?: string;
}) {
  const hue = avatarHue(id);
  const letter = (name || "?").charAt(0).toUpperCase();
  return (
    <span
      className={cn(
        "inline-grid place-items-center rounded-full font-display font-semibold text-bg",
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.42,
        background: `linear-gradient(145deg, hsl(${hue} 62% 62%), hsl(${(hue + 40) % 360} 50% 42%))`,
      }}
      aria-hidden
    >
      {letter}
    </span>
  );
}
