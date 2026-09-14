import Image from "next/image";

import { cn } from "@/lib/utils";
import gotchuWordmark from "@/public/brand/gotchu-wordmark-black.png";

export function GotchuWordmark({
  alt = "Gotchu",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Image>, "src" | "width" | "height" | "alt"> & {
  alt?: string;
}) {
  return (
    <Image
      src={gotchuWordmark}
      alt={alt}
      loading="eager"
      sizes="(max-width: 640px) 112px, 128px"
      className={cn(
        "h-auto w-[6.7em] shrink-0 object-contain",
        className,
      )}
      {...props}
    />
  );
}
