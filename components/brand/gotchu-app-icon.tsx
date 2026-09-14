import Image from "next/image";

import { cn } from "@/lib/utils";
import gotchuAppIcon from "@/public/brand/gotchu-app-icon.png";

export function GotchuAppIcon({
  alt = "Gotchu",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Image>, "src" | "width" | "height" | "alt"> & {
  alt?: string;
}) {
  return (
    <Image
      src={gotchuAppIcon}
      alt={alt}
      sizes="48px"
      className={cn("size-9 shrink-0 rounded-[24%] object-contain", className)}
      {...props}
    />
  );
}
