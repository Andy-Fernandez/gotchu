import { cn } from "@/lib/utils";

export function GotchuConfirmationMark({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-16 shrink-0 items-center justify-center rounded-full [background:var(--brand-sheen)]",
        className,
      )}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        className="size-[42%] text-foreground"
        fill="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M12 1.8c.84 6.01 4.19 9.36 10.2 10.2-6.01.84-9.36 4.19-10.2 10.2C11.16 16.19 7.81 12.84 1.8 12 7.81 11.16 11.16 7.81 12 1.8Z"
        />
      </svg>
    </span>
  );
}
