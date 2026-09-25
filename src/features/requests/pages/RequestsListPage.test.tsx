import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import RequestsListPage from "@/features/requests/pages/RequestsListPage";
import * as api from "@/features/requests/api/RequestsApi";
import { makeRequests, makeRequest } from "@/test/factories";
import type { PaginatedResponse, RequestItem } from "@/features/requests/types/requests";

vi.mock("@/features/requests/api/RequestsApi", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/requests/api/RequestsApi")>();
  return {
    ...actual,
    fetchRequests: vi.fn(),
    updateRequestStatus: vi.fn(),
    updateRequest: vi.fn(),
    deleteRequest: vi.fn(),
  };
});

const allRows = makeRequests(12);

/** يحاكي الـ API الحقيقي: يقتطع حسب الفلاتر بدلاً من إعادة صفحة ثابتة */
function pageFor(filters: { page: number; limit: number }) {
  const start = (filters.page - 1) * filters.limit;
  return {
    data: allRows.slice(start, start + filters.limit),
    total: allRows.length,
    totalPages: Math.ceil(allRows.length / filters.limit),
  } as PaginatedResponse<RequestItem>;
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <RequestsListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const rowFor = (title: string) =>
  screen.getByText(title).closest("tr") as HTMLElement;

// زر تغيير الحالة هو الوحيد داخل الصف الذي يحمل aria-haspopup="listbox"
const statusTriggerIn = (row: HTMLElement) =>
  within(row).getByRole("button", { name: /^Change status/ });

// زر الحالة في كل صف يحمل aria-label يبدأ بـ "Change status"،
// لذلك نثبّت بداية اسم زر الفلتر حتى لا يطابقهما نفس التعبير
const statusFilterButton = () =>
  screen.getByRole("button", { name: /^(All Statuses|Status:)/ });
const priorityFilterButton = () =>
  screen.getByRole("button", { name: /^(All Priorities|Priority:)/ });
const sortFilterButton = () =>
  screen.getByRole("button", { name: /^Sort:/ });

// useRequests يفعّل retry: 2، أي أن الخطأ الأولي يستغرق ~3 ثوانٍ
// قبل أن يظهر، لذلك نقدّم المؤقتات في اختبارات الخطأ
async function flushRetries() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(10000);
  });
}

const lastSearchCall = () => {
  const calls = vi.mocked(api.fetchRequests).mock.calls;
  return calls[calls.length - 1][0];
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.fetchRequests).mockImplementation(async (filters) => pageFor(filters));
  vi.mocked(api.updateRequestStatus).mockResolvedValue(makeRequest());
  vi.mocked(api.updateRequest).mockResolvedValue(makeRequest());
  vi.mocked(api.deleteRequest).mockResolvedValue({ id: "REQ-1" });
});

describe("RequestsListPage data display", () => {
  it("renders the rows returned by the API", async () => {
    renderPage();
    expect(await screen.findByText("Request title 1")).toBeTruthy();
    expect(screen.getByText("Request title 5")).toBeTruthy();
    expect(screen.queryByText("Request title 6")).toBeNull();
  });

  it("shows the total count", async () => {
    renderPage();
    expect(await screen.findByText(/12 total requests/)).toBeTruthy();
  });

  it("shows the visible result range", async () => {
    renderPage();
    expect(await screen.findByText(/Showing/)).toBeTruthy();
    const summary = screen.getByText(/Showing/).textContent ?? "";
    expect(summary).toContain("1");
    expect(summary).toContain("5");
    expect(summary).toContain("12");
  });

  it("shows a loading state before the data arrives", async () => {
    renderPage();
    expect(screen.getByText(/Loading requests/)).toBeTruthy();
    expect(await screen.findByText("Request title 1")).toBeTruthy();
  });

  it("shows an empty state when nothing matches", async () => {
    vi.mocked(api.fetchRequests).mockResolvedValue({ data: [], total: 0, totalPages: 1 } as PaginatedResponse<RequestItem>);
    renderPage();
    expect(await screen.findByText(/No requests match/)).toBeTruthy();
  });
});

describe("RequestsListPage pagination", () => {
  it("requests the next page", async () => {
    renderPage();
    await screen.findByText("Request title 1");

    fireEvent.click(screen.getByLabelText("Next page"));

    await waitFor(() => expect(lastSearchCall().page).toBe(2));
  });

  it("returns to the previous page", async () => {
    renderPage();
    await screen.findByText("Request title 1");
    fireEvent.click(screen.getByLabelText("Next page"));
    await waitFor(() => expect(lastSearchCall().page).toBe(2));

    await screen.findByText("Request title 6");
    fireEvent.click(screen.getByLabelText("Previous page"));

    await waitFor(() => expect(lastSearchCall().page).toBe(1));
  });

  it("disables previous on the first page", async () => {
    renderPage();
    await screen.findByText("Request title 1");
    expect((screen.getByLabelText("Previous page") as HTMLButtonElement).disabled).toBe(true);
  });
});

describe("RequestsListPage filters", () => {
  it("shows a chip for the active status filter and can remove it", async () => {
    renderPage();
    await screen.findByText("Request title 1");

    fireEvent.click(statusFilterButton());
    fireEvent.click(screen.getByRole("option", { name: "In Progress" }));

    await waitFor(() => expect(lastSearchCall().status).toBe("in_progress"));
    expect(await screen.findByText("Status: In Progress")).toBeTruthy();

    fireEvent.click(screen.getByLabelText("Remove filter Status: In Progress"));

    await waitFor(() => expect(lastSearchCall().status).toBe(""));
  });

  it("clears every filter at once", async () => {
    renderPage();
    await screen.findByText("Request title 1");
    fireEvent.click(priorityFilterButton());
    fireEvent.click(screen.getByRole("option", { name: "Urgent" }));
    await waitFor(() => expect(lastSearchCall().priority).toBe("urgent"));

    fireEvent.click(await screen.findByRole("button", { name: "Clear all" }));

    await waitFor(() => {
      expect(lastSearchCall().priority).toBe("");
      expect(lastSearchCall().status).toBe("");
    });
  });

  it("passes the chosen sort to the API", async () => {
    renderPage();
    await screen.findByText("Request title 1");

    fireEvent.click(sortFilterButton());
    fireEvent.click(screen.getByRole("option", { name: "Priority" }));

    await waitFor(() => expect(lastSearchCall().sortBy).toBe("priority"));
  });
});

describe("RequestsListPage row actions", () => {
  it("changes a status inline and confirms with a toast", async () => {
    renderPage();
    await screen.findByText("Request title 1");

    const row = rowFor("Request title 1");
    fireEvent.click(statusTriggerIn(row));
    fireEvent.click(screen.getByRole("option", { name: /Completed/ }));

    await waitFor(() =>
      expect(api.updateRequestStatus).toHaveBeenCalledWith("REQ-1", "completed"),
    );
    expect(await screen.findByText("Status updated.")).toBeTruthy();
  });

  it("reports a failed status change", async () => {
    vi.mocked(api.updateRequestStatus).mockRejectedValue(new Error("boom"));
    renderPage();
    await screen.findByText("Request title 1");

    const row = rowFor("Request title 1");
    fireEvent.click(statusTriggerIn(row));
    fireEvent.click(screen.getByRole("option", { name: /Completed/ }));

    expect(
      await screen.findByText(/Could not update status/),
    ).toBeTruthy();
  });

  it("deletes a request from the row menu", async () => {
    renderPage();
    await screen.findByText("Request title 1");

    const row = rowFor("Request title 1");
    fireEvent.click(within(row).getByLabelText("Row actions"));
    fireEvent.click(screen.getByRole("menuitem", { name: /Delete/ }));

    // useDeleteRequest يفكّ { id } قبل استدعاء الـ API، لذا تأخذ الدالة
    // المعرّف كسلسلة نصية
    await waitFor(() => expect(api.deleteRequest).toHaveBeenCalledWith("REQ-1"));
    expect(await screen.findByText("REQ-1 deleted.")).toBeTruthy();
  });

  it("reports a failed delete", async () => {
    vi.mocked(api.deleteRequest).mockRejectedValue(new Error("boom"));
    renderPage();
    await screen.findByText("Request title 1");

    const row = rowFor("Request title 1");
    fireEvent.click(within(row).getByLabelText("Row actions"));
    fireEvent.click(screen.getByRole("menuitem", { name: /Delete/ }));

    expect(await screen.findByText(/Could not delete/)).toBeTruthy();
  });

  it("opens the edit drawer from the View button", async () => {
    renderPage();
    await screen.findByText("Request title 1");

    const row = rowFor("Request title 1");
    fireEvent.click(within(row).getByRole("button", { name: "View" }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
    expect((screen.getByLabelText("Title") as HTMLInputElement).value).toBe(
      "Request title 1",
    );
  });

  it("opens the edit drawer from the row menu", async () => {
    renderPage();
    await screen.findByText("Request title 1");

    const row = rowFor("Request title 1");
    fireEvent.click(within(row).getByLabelText("Row actions"));
    fireEvent.click(screen.getByRole("menuitem", { name: /Edit/ }));

    expect(await screen.findByRole("dialog")).toBeTruthy();
  });
});

describe("RequestsListPage error handling", () => {
  it("offers a retry when the first load fails", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(api.fetchRequests).mockRejectedValue(new Error("Network response error"));
      renderPage();

      await flushRetries();

      expect(screen.getByText(/Network response error/)).toBeTruthy();
      expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("keeps the rows visible when a background refresh fails", async () => {
    renderPage();
    await screen.findByText("Request title 1");

    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(api.fetchRequests).mockRejectedValue(new Error("Network response error"));
      fireEvent.click(screen.getByRole("button", { name: /Refresh/ }));

      await flushRetries();

      expect(screen.getByText(/Could not refresh data/)).toBeTruthy();
      // the previously loaded rows are still on screen
      expect(screen.getByText("Request title 1")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });
});
