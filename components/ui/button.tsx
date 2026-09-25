"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex shrink-0 touch-manipulation select-none items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-button transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[loading=true]:text-transparent data-[loading=true]:opacity-100 data-[loading=true]:before:absolute data-[loading=true]:before:size-4 data-[loading=true]:before:animate-spin data-[loading=true]:before:rounded-full data-[loading=true]:before:border-2 data-[loading=true]:before:border-[var(--button-spinner)] data-[loading=true]:before:border-r-transparent data-[loading=true]:before:content-[''] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground [--button-spinner:var(--primary-foreground)] hover:bg-primary/90 active:bg-primary/80",
        secondary:
          "border-border bg-secondary text-secondary-foreground [--button-spinner:var(--secondary-foreground)] hover:bg-muted active:bg-border",
        ghost:
          "text-foreground [--button-spinner:var(--foreground)] hover:bg-muted active:bg-border",
        destructive:
          "bg-destructive-subtle text-destructive [--button-spinner:var(--destructive)] hover:bg-destructive/10 active:bg-destructive/20",
        link: "text-accent-foreground underline-offset-4 [--button-spinner:var(--accent-foreground)] hover:text-accent-hover hover:underline active:text-accent-hover",
      },
      size: {
        default: "h-11 px-4",
        lg: "h-13 px-5",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  };

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  loading = false,
  disabled,
  onClick,
  tabIndex,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  const isDisabled = Boolean(disabled || loading);

  const handleClick: React.MouseEventHandler<HTMLElement> = (event) => {
    if (asChild && isDisabled) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
  };

  return (
    <Comp
      {...props}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      aria-disabled={asChild && isDisabled ? true : undefined}
      disabled={asChild ? undefined : isDisabled}
      onClick={handleClick}
      tabIndex={asChild && isDisabled ? -1 : tabIndex}
      className={cn(buttonVariants({ variant, size, className }))}
    />
  );
}

type IconButtonProps = Omit<ButtonProps, "aria-label" | "children" | "size"> & {
  label: string;
  children: React.ReactNode;
};

function IconButton({ label, children, ...props }: IconButtonProps) {
  return (
    <Button size="icon" aria-label={label} {...props}>
      {children}
    </Button>
  );
}

export { Button, IconButton };
export type { ButtonProps, IconButtonProps };
