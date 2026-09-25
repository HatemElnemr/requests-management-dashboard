import { INITIAL_MOCK_REQUESTS, PRIORITY_ORDER, STATUS_ORDER } from "../data/MockRequests";
import type {
  PaginatedResponse,
  RequestFilters,
  RequestItem,
  RequestSortBy,
  RequestStatus,
} from "../types/requests";

const simulateNetwork = (failureRate = 0.2): Promise<void> => {
  return new Promise((resolve, reject) => {
    const delay = Math.floor(Math.random() * 1000) + 500;
    setTimeout(() => {
      if (Math.random() < failureRate) {
        reject(new Error("Network response error"));
      } else {
        resolve();
      }
    }, delay);
  });
};

const byDateDesc = (key: "createdAt" | "updatedAt") => (a: RequestItem, b: RequestItem) =>
  new Date(b[key]).getTime() - new Date(a[key]).getTime();

const sorters: Record<RequestSortBy, (a: RequestItem, b: RequestItem) => number> = {
  createdAt: byDateDesc("createdAt"),
  updatedAt: byDateDesc("updatedAt"),
  priority: (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority],
  status: (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status],
};

export const fetchRequests = async (
  filters: RequestFilters,
): Promise<PaginatedResponse<RequestItem>> => {
  await simulateNetwork(0.05);

  let result = [...INITIAL_MOCK_REQUESTS];

  if (filters.search) {
    const term = filters.search.toLowerCase();
    result = result.filter(
      (r) =>
        r.title.toLowerCase().includes(term) ||
        r.owner.toLowerCase().includes(term) ||
        r.id.toLowerCase().includes(term),
    );
  }

  if (filters.status) result = result.filter((r) => r.status === filters.status);
  if (filters.priority) result = result.filter((r) => r.priority === filters.priority);

  result.sort(sorters[filters.sortBy]);

  const total = result.length;
  const start = (filters.page - 1) * filters.limit;
  const paginatedData = result.slice(start, start + filters.limit);

  return {
    data: paginatedData,
    total,
    totalPages: Math.ceil(total / filters.limit) || 1,
  };
};

export const updateRequestStatus = async (
  id: string,
  newStatus: RequestStatus,
): Promise<RequestItem> => {
  await simulateNetwork(0.3); // 30% failure rate for testing optimistic rollback

  const index = INITIAL_MOCK_REQUESTS.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Request not found");

  INITIAL_MOCK_REQUESTS[index] = {
    ...INITIAL_MOCK_REQUESTS[index],
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };

  return INITIAL_MOCK_REQUESTS[index];
};

export const updateRequest = async (updated: RequestItem): Promise<RequestItem> => {
  await simulateNetwork(0.3);

  const index = INITIAL_MOCK_REQUESTS.findIndex((r) => r.id === updated.id);
  if (index === -1) throw new Error("Request not found");

  INITIAL_MOCK_REQUESTS[index] = {
    ...updated,
    updatedAt: new Date().toISOString(),
  };

  return INITIAL_MOCK_REQUESTS[index];
};

export const deleteRequest = async (id: string): Promise<{ id: string }> => {
  await simulateNetwork(0.3);

  const index = INITIAL_MOCK_REQUESTS.findIndex((r) => r.id === id);
  if (index === -1) throw new Error("Request not found");

  INITIAL_MOCK_REQUESTS.splice(index, 1);
  return { id };
};
