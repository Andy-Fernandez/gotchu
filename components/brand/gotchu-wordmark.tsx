import * as React from "react";

import { cn } from "@/lib/utils";

export function GotchuWordmark({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xl font-bold tracking-[-0.055em] text-foreground",
        className,
      )}
      {...props}
    >
      <span>gotchu</span>
      <span aria-hidden="true" className="translate-y-[-0.04em] text-[0.8em] tracking-normal">
        ✦
      </span>
    </span>
  );
}
