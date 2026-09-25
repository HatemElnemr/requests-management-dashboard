import type { RequestItem, RequestPriority, RequestStatus } from "@/features/requests/types/requests";

let counter = 0;

/** يبني طلباً للاختبارات مع إمكانية تجاوز أي حقل */
export function makeRequest(overrides: Partial<RequestItem> = {}): RequestItem {
  counter += 1;
  const base: RequestItem = {
    id: `REQ-${100 + counter}`,
    title: `Request title ${counter}`,
    status: "open",
    priority: "medium",
    owner: "Test Owner",
    ownerInitials: "TO",
    ownerColor: "#123456",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  };
  return { ...base, ...overrides };
}

/** يبني عدة طلبات */
export function makeRequests(count: number, overrides: Partial<RequestItem> = {}) {
  return Array.from({ length: count }, (_, i) => makeRequest({ id: `REQ-${i + 1}`, ...overrides }));
}

export const STATUS_VALUES: RequestStatus[] = ["open", "in_progress", "completed", "canceled"];
export const PRIORITY_VALUES: RequestPriority[] = ["low", "medium", "high", "urgent"];
