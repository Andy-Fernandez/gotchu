import { PanelShell } from "@/components/layout/panel-shell";
import type { ReactNode } from "react";

export default function PanelLayout({ children }: { children: ReactNode }) {
  return <PanelShell>{children}</PanelShell>;
}
