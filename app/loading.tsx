import { GotchuSplash } from "@/components/brand/gotchu-splash";

export default function Loading() {
  return (
    <main>
      <GotchuSplash role="status" aria-live="polite" className="min-h-dvh" />
    </main>
  );
}
