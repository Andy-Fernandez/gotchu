import type { ReactNode } from "react";

type RouteSkeletonProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function RouteSkeleton({
  eyebrow,
  title,
  description,
  children,
}: RouteSkeletonProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-16">
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-10">
        <p className="text-sm font-semibold tracking-[0.14em] text-muted-foreground uppercase">
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">
          {description}
        </p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
