import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import type { RequestFilters } from "@/features/requests/types/requests";

type Api = typeof import("@/features/requests/api/RequestsApi");

// كل دالة في الـ API تنتظر setTimeout و ترمي خطأ بشكل عشوائي،
// لذلك نثبّت Math.random و نستخدم مؤقتات وهمية لجعل السلوك حتمياً.
const SUCCESS_RANDOM = 0.9; // >= كل failureRate => نجاح دائماً
const FAILURE_RANDOM = 0.01; // < كل failureRate => فشل دائماً

let api: Api;
let dataModule: typeof import("@/features/requests/data/MockRequests");

/** ينتظر انتهاء كل المؤقتات المعلّقة دفعة واحدة */
async function settleNetwork() {
  await vi.advanceTimersByTimeAsync(2500);
}

const baseFilters: RequestFilters = {
  page: 1,
  limit: 5,
  search: "",
  status: "",
  priority: "",
  sortBy: "updatedAt",
};

beforeEach(async () => {
  vi.useFakeTimers();
  vi.spyOn(Math, "random").mockReturnValue(SUCCESS_RANDOM);
  // وحدة جديدة في كل اختبار حتى لا تتسرّب تعديلات الـ mock بين الاختبارات
  vi.resetModules();
  api = await import("@/features/requests/api/RequestsApi");
  dataModule = await import("@/features/requests/data/MockRequests");
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("fetchRequests pagination", () => {
  it("returns every request when no filter is applied", async () => {
    const promise = api.fetchRequests(baseFilters);
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBe(dataModule.INITIAL_MOCK_REQUESTS.length);
    expect(result.total).toBe(25);
  });

  it("returns at most limit items per page", async () => {
    const promise = api.fetchRequests(baseFilters);
    await settleNetwork();
    const result = await promise;

    expect(result.data).toHaveLength(5);
  });

  it("computes totalPages from the total", async () => {
    const promise = api.fetchRequests({ ...baseFilters, limit: 5 });
    await settleNetwork();
    const result = await promise;

    expect(result.totalPages).toBe(5); // 25 / 5
  });

  it("returns a different slice for page 2", async () => {
    const firstPromise = api.fetchRequests({ ...baseFilters, page: 1 });
    await settleNetwork();
    const first = await firstPromise;

    const secondPromise = api.fetchRequests({ ...baseFilters, page: 2 });
    await settleNetwork();
    const second = await secondPromise;

    expect(second.data).toHaveLength(5);
    expect(second.data[0].id).not.toBe(first.data[0].id);
  });

  it("returns a short page when the total is not a multiple of limit", async () => {
    const promise = api.fetchRequests({ ...baseFilters, limit: 10, page: 3 });
    await settleNetwork();
    const result = await promise;

    expect(result.totalPages).toBe(3);
    expect(result.data).toHaveLength(5); // 25 - 20
  });

  it("returns an empty page beyond the last one", async () => {
    const promise = api.fetchRequests({ ...baseFilters, page: 99 });
    await settleNetwork();
    const result = await promise;

    expect(result.data).toHaveLength(0);
    expect(result.total).toBe(25);
  });

  it("reports at least one page when there are no results", async () => {
    const promise = api.fetchRequests({ ...baseFilters, search: "zzz-no-match" });
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });
});

describe("fetchRequests search", () => {
  it("matches the title case-insensitively", async () => {
    const promise = api.fetchRequests({ ...baseFilters, search: "STRIPE" });
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBe(1);
    expect(result.data[0].title).toBe("Integrate Stripe Payment Gateway Webhooks");
  });

  it("matches the owner case-insensitively", async () => {
    const promise = api.fetchRequests({ ...baseFilters, search: "sara", limit: 50 });
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBe(4);
    expect(result.data.every((r) => r.owner === "Sara Ali")).toBe(true);
  });

  it("matches the request id", async () => {
    const promise = api.fetchRequests({ ...baseFilters, search: "REQ-119" });
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBe(1);
    expect(result.data[0].id).toBe("REQ-119");
  });

  it("returns nothing for a term that matches no request", async () => {
    const promise = api.fetchRequests({ ...baseFilters, search: "nothing-here" });
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBe(0);
    expect(result.data).toHaveLength(0);
  });
});

describe("fetchRequests filters", () => {
  it("filters by status", async () => {
    const promise = api.fetchRequests({ ...baseFilters, status: "completed", limit: 50 });
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThan(25);
    expect(result.data.every((r) => r.status === "completed")).toBe(true);
  });

  it("filters by priority", async () => {
    const promise = api.fetchRequests({ ...baseFilters, priority: "urgent", limit: 50 });
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBeGreaterThan(0);
    expect(result.data.every((r) => r.priority === "urgent")).toBe(true);
  });

  it("ANDs status and priority together", async () => {
    const promise = api.fetchRequests({
      ...baseFilters,
      status: "open",
      priority: "urgent",
      limit: 50,
    });
    await settleNetwork();
    const result = await promise;

    expect(result.data.every((r) => r.status === "open" && r.priority === "urgent")).toBe(true);
    expect(result.total).toBeLessThan(25);
  });

  it("combines search with a status filter", async () => {
    const promise = api.fetchRequests({
      ...baseFilters,
      search: "sara",
      status: "completed",
      limit: 50,
    });
    await settleNetwork();
    const result = await promise;

    expect(result.total).toBeGreaterThan(0);
    expect(
      result.data.every((r) => r.owner === "Sara Ali" && r.status === "completed"),
    ).toBe(true);
  });
});

describe("fetchRequests sorting", () => {
  it("sorts by createdAt newest first", async () => {
    const promise = api.fetchRequests({ ...baseFilters, sortBy: "createdAt", limit: 50 });
    await settleNetwork();
    const { data } = await promise;

    const times = data.map((r) => Date.parse(r.createdAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("sorts by updatedAt newest first", async () => {
    const promise = api.fetchRequests({ ...baseFilters, sortBy: "updatedAt", limit: 50 });
    await settleNetwork();
    const { data } = await promise;

    const times = data.map((r) => Date.parse(r.updatedAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it("sorts by priority with urgent first", async () => {
    const promise = api.fetchRequests({ ...baseFilters, sortBy: "priority", limit: 50 });
    await settleNetwork();
    const { data } = await promise;

    const rank: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const ranks = data.map((r) => rank[r.priority]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(ranks[0]).toBe(0);
  });

  it("sorts by status with in_progress first", async () => {
    const promise = api.fetchRequests({ ...baseFilters, sortBy: "status", limit: 50 });
    await settleNetwork();
    const { data } = await promise;

    const rank: Record<string, number> = { in_progress: 0, open: 1, completed: 2, canceled: 3 };
    const ranks = data.map((r) => rank[r.status]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
    expect(ranks[0]).toBe(0);
  });

  it("sorts before paginating", async () => {
    const allPromise = api.fetchRequests({ ...baseFilters, sortBy: "priority", limit: 50 });
    await settleNetwork();
    const all = await allPromise;

    const pagePromise = api.fetchRequests({ ...baseFilters, sortBy: "priority", limit: 5 });
    await settleNetwork();
    const page = await pagePromise;

    expect(page.data.map((r) => r.id)).toEqual(all.data.slice(0, 5).map((r) => r.id));
  });
});

describe("mutations", () => {
  it("updateRequestStatus applies the new status", async () => {
    const target = dataModule.INITIAL_MOCK_REQUESTS[0];
    const promise = api.updateRequestStatus(target.id, "completed");
    await settleNetwork();
    const updated = await promise;

    expect(updated.status).toBe("completed");
    expect(updated.id).toBe(target.id);
  });

  it("updateRequestStatus refreshes updatedAt", async () => {
    const target = dataModule.INITIAL_MOCK_REQUESTS[0];
    const before = target.updatedAt;

    const promise = api.updateRequestStatus(target.id, "canceled");
    await settleNetwork();
    const updated = await promise;

    expect(Date.parse(updated.updatedAt)).toBeGreaterThanOrEqual(Date.parse(before));
  });

  it("updateRequestStatus persists into the store", async () => {
    const target = dataModule.INITIAL_MOCK_REQUESTS[0];

    const updatePromise = api.updateRequestStatus(target.id, "completed");
    await settleNetwork();
    await updatePromise;

    const fetchPromise = api.fetchRequests({ ...baseFilters, search: target.id });
    await settleNetwork();
    const { data } = await fetchPromise;

    expect(data[0].status).toBe("completed");
  });

  it("updateRequest saves the edited fields and keeps the id", async () => {
    const target = dataModule.INITIAL_MOCK_REQUESTS[0];
    const edited = { ...target, title: "Renamed title", owner: "New Owner" };

    const promise = api.updateRequest(edited);
    await settleNetwork();
    const saved = await promise;

    expect(saved.title).toBe("Renamed title");
    expect(saved.owner).toBe("New Owner");
    expect(saved.id).toBe(target.id);
  });

  it("deleteRequest removes the row from the store", async () => {
    const before = dataModule.INITIAL_MOCK_REQUESTS.length;
    const target = dataModule.INITIAL_MOCK_REQUESTS[0];

    const promise = api.deleteRequest(target.id);
    await settleNetwork();
    await promise;

    expect(dataModule.INITIAL_MOCK_REQUESTS).toHaveLength(before - 1);
    expect(dataModule.INITIAL_MOCK_REQUESTS.some((r) => r.id === target.id)).toBe(false);
  });

  it("deleteRequest removes the row from fetch results", async () => {
    const target = dataModule.INITIAL_MOCK_REQUESTS[0];

    const deletePromise = api.deleteRequest(target.id);
    await settleNetwork();
    await deletePromise;

    const fetchPromise = api.fetchRequests({ ...baseFilters, limit: 50 });
    await settleNetwork();
    const { data } = await fetchPromise;

    expect(data.some((r) => r.id === target.id)).toBe(false);
  });
});

describe("error handling", () => {
  it("rejects for an unknown id on updateRequestStatus", async () => {
    const promise = api.updateRequestStatus("REQ-NOPE", "open");
    const assertion = expect(promise).rejects.toThrow("Request not found");
    await settleNetwork();
    await assertion;
  });

  it("rejects for an unknown id on updateRequest", async () => {
    const promise = api.updateRequest({
      id: "REQ-NOPE",
      title: "x",
      status: "open",
      priority: "low",
      owner: "x",
      ownerInitials: "X",
      ownerColor: "#000",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    });
    const assertion = expect(promise).rejects.toThrow("Request not found");
    await settleNetwork();
    await assertion;
  });

  it("rejects for an unknown id on deleteRequest", async () => {
    const promise = api.deleteRequest("REQ-NOPE");
    const assertion = expect(promise).rejects.toThrow("Request not found");
    await settleNetwork();
    await assertion;
  });

  it("rejects the fetch when the simulated network fails", async () => {
    vi.mocked(Math.random).mockReturnValue(FAILURE_RANDOM);

    const promise = api.fetchRequests(baseFilters);
    const assertion = expect(promise).rejects.toThrow("Network response error");
    await settleNetwork();
    await assertion;
  });

  it("rejects the mutation when the simulated network fails", async () => {
    const target = dataModule.INITIAL_MOCK_REQUESTS[0];
    vi.mocked(Math.random).mockReturnValue(FAILURE_RANDOM);

    const promise = api.updateRequestStatus(target.id, "completed");
    const assertion = expect(promise).rejects.toThrow("Network response error");
    await settleNetwork();
    await assertion;
  });
});
