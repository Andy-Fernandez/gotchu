import { BadgeCheck, CircleCheck, Clock3 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { ServiceHistoryBookingStatus } from "@/modules/operations/service-history-types";

import { getServiceHistoryStatusPresentation } from "./service-history-formatters";

const statusIcons = {
  reserved_pending_review: Clock3,
  confirmed: BadgeCheck,
  completed: CircleCheck,
} satisfies Record<ServiceHistoryBookingStatus, typeof Clock3>;

type ServiceStatusBadgeProps = {
  status: ServiceHistoryBookingStatus;
};

export function ServiceStatusBadge({ status }: ServiceStatusBadgeProps) {
  const presentation = getServiceHistoryStatusPresentation(status);
  const Icon = statusIcons[status];

  return (
    <Badge
      variant={presentation.tone}
      className="h-6 gap-1.5 px-2.5 text-caption font-semibold"
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {presentation.label}
    </Badge>
  );
}
