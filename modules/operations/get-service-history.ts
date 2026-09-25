import {
  demoServiceHistory,
  demoServiceHistoryShopId,
} from "./demo-service-history.ts";
import type {
  ServiceHistoryBookingStatus,
  ServiceHistoryCounts,
  ServiceHistoryFilter,
  ServiceHistoryRecord,
} from "./service-history-types.ts";
import { serviceHistoryFilterValues } from "./service-history-types.ts";

type ServiceHistoryReader = {
  list(shopId: string): Promise<ServiceHistoryRecord[]>;
  find(shopId: string, bookingId: string): Promise<ServiceHistoryRecord | null>;
};

const bookingStatusByFilter: Partial<
  Record<ServiceHistoryFilter, ServiceHistoryBookingStatus>
> = {
  pendientes: "reserved_pending_review",
  confirmados: "confirmed",
  realizados: "completed",
};

function copyRecord(record: ServiceHistoryRecord): ServiceHistoryRecord {
  return {
    ...record,
    items: record.items.map((item) => ({ ...item })),
  };
}

export function createServiceHistoryReader(
  source: readonly ServiceHistoryRecord[],
): ServiceHistoryReader {
  return {
    async list(shopId) {
      return source
        .filter((record) => record.shopId === shopId)
        .toSorted((left, right) => {
          const byStart = right.scheduledStart.localeCompare(
            left.scheduledStart,
          );
          return byStart || left.id.localeCompare(right.id);
        })
        .map(copyRecord);
    },
    async find(shopId, bookingId) {
      const record = source.find(
        (candidate) =>
          candidate.shopId === shopId && candidate.id === bookingId,
      );

      return record ? copyRecord(record) : null;
    },
  };
}

export function parseServiceHistoryFilter(
  value: string | string[] | undefined,
): ServiceHistoryFilter {
  const candidate = Array.isArray(value) ? value[0] : value;

  return serviceHistoryFilterValues.includes(candidate as ServiceHistoryFilter)
    ? (candidate as ServiceHistoryFilter)
    : "todos";
}

export function filterServiceHistory(
  records: readonly ServiceHistoryRecord[],
  filter: ServiceHistoryFilter,
): ServiceHistoryRecord[] {
  const bookingStatus = bookingStatusByFilter[filter];

  return records
    .filter(
      (record) => !bookingStatus || record.bookingStatus === bookingStatus,
    )
    .map(copyRecord);
}

export function countServiceHistory(
  records: readonly ServiceHistoryRecord[],
): ServiceHistoryCounts {
  return {
    todos: records.length,
    pendientes: records.filter(
      (record) => record.bookingStatus === "reserved_pending_review",
    ).length,
    confirmados: records.filter(
      (record) => record.bookingStatus === "confirmed",
    ).length,
    realizados: records.filter((record) => record.bookingStatus === "completed")
      .length,
  };
}

const demoReader = createServiceHistoryReader(demoServiceHistory);

/** Staff application operation. The in-memory reader will be replaced by the chosen data adapter. */
export function getServiceHistory(): Promise<ServiceHistoryRecord[]> {
  return demoReader.list(demoServiceHistoryShopId);
}

/** Staff application operation scoped to the current demo shop. */
export function getServiceHistoryRecord(
  bookingId: string,
): Promise<ServiceHistoryRecord | null> {
  return demoReader.find(demoServiceHistoryShopId, bookingId);
}
