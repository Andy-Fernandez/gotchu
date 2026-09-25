import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full resize-y rounded-md border border-input bg-card px-4 py-3 text-body text-foreground transition-colors placeholder:text-muted-foreground hover:border-muted-foreground focus-visible:border-ring focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:border-input disabled:bg-muted disabled:text-muted-foreground disabled:hover:border-input read-only:cursor-default read-only:border-input read-only:bg-muted read-only:text-muted-foreground read-only:hover:border-input aria-invalid:border-destructive aria-invalid:hover:border-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
