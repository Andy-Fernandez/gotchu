import { cn } from "@/lib/utils";

import { GotchuPill } from "./gotchu-pill";

export function GotchuSplash({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center justify-center overflow-hidden bg-foreground px-6 text-primary-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex w-full max-w-sm flex-col items-center text-center">
        <GotchuPill
          variant="fill"
          alt=""
          loading="eager"
          className="motion-safe:animate-pulse"
        />
        <p className="mt-8 text-title-sm tracking-tight">
          Preparando tu experiencia
        </p>
        <p className="mt-2 text-body-sm text-white/60">Tu corte, asegurado.</p>
      </div>
    </div>
  );
}
