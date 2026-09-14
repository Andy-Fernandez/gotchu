import Image from "next/image";

import { cn } from "@/lib/utils";
import gotchuPillFill from "@/public/brand/gotchu-pill-holographic-fill.png";
import gotchuPillOutline from "@/public/brand/gotchu-pill-holographic-outline.png";

type GotchuPillProps = Omit<
  React.ComponentProps<typeof Image>,
  "src" | "width" | "height" | "alt"
> & {
  alt?: string;
  variant?: "fill" | "outline";
};

const variants = {
  fill: gotchuPillFill,
  outline: gotchuPillOutline,
} as const;

export function GotchuPill({
  alt = "Gotchu",
  className,
  variant = "fill",
  ...props
}: GotchuPillProps) {
  return (
    <Image
      src={variants[variant]}
      alt={alt}
      sizes="(max-width: 640px) 80vw, 420px"
      className={cn("h-auto w-full object-contain", className)}
      {...props}
    />
  );
}
