import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ControlsBar, SEARCH_DEBOUNCE_MS } from "@/features/requests/components/ControlsBar";
import RequestsListPage from "@/features/requests/pages/RequestsListPage";
import * as api from "@/features/requests/api/RequestsApi";
import {
  PRIORITY_SELECT_OPTIONS,
  SORT_OPTIONS,
  STATUS_SELECT_OPTIONS,
} from "@/features/requests/data/MockRequests";
import type {
  PaginatedResponse,
  RequestItem,
  RequestStatus,
} from "@/features/requests/types/requests";

vi.mock("@/features/requests/api/RequestsApi", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/requests/api/RequestsApi")>();
  return { ...actual, fetchRequests: vi.fn() };
});

const emptyPage: PaginatedResponse<RequestItem> = { data: [], total: 0, totalPages: 1 };

type BarProps = React.ComponentProps<typeof ControlsBar>;

function renderBar(overrides: Partial<BarProps> = {}) {
  const onSearchChange = vi.fn<(value: string) => void>();
  const onStatusChange = vi.fn<(value: RequestStatus | "") => void>();

  const props: BarProps = {
    searchQuery: "",
    selectedStatus: "",
    selectedPriority: "",
    selectedSort: "updatedAt",
    statusOptions: STATUS_SELECT_OPTIONS,
    priorityOptions: PRIORITY_SELECT_OPTIONS,
    sortOptions: SORT_OPTIONS,
    onSearchChange,
    onStatusChange,
    onPriorityChange: vi.fn(),
    onSortChange: vi.fn(),
    ...overrides,
  };

  return { props, onSearchChange, onStatusChange, ...render(<ControlsBar {...props} />) };
}

const input = () => screen.getByLabelText("Search requests") as HTMLInputElement;
const type = (value: string) => fireEvent.change(input(), { target: { value } });
const settle = () =>
  act(() => {
    vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS);
  });

describe("ControlsBar search debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not emit while the user is still typing", () => {
    const { onSearchChange } = renderBar();

    type("s");
    type("st");
    type("str");

    expect(onSearchChange).not.toHaveBeenCalled();
  });

  it("keeps the input responsive while the value is pending", () => {
    renderBar();
    type("str");
    // the field reflects typing immediately, without waiting for the debounce
    expect(input().value).toBe("str");
  });

  it("emits exactly once with the final value after the debounce", () => {
    const { onSearchChange } = renderBar();

    type("s");
    type("st");
    type("str");
    type("stri");
    type("strip");
    settle();

    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith("strip");
  });

  it("restarts the timer on each keystroke", () => {
    const { onSearchChange } = renderBar();

    type("a");
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50));
    type("ab");
    act(() => vi.advanceTimersByTime(SEARCH_DEBOUNCE_MS - 50));

    // the first timer would have fired by now, but the second reset it
    expect(onSearchChange).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(60));
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(onSearchChange).toHaveBeenCalledWith("ab");
  });

  it("clears immediately and cancels a pending search", () => {
    const { onSearchChange } = renderBar();

    type("stripe");
    settle();
    onSearchChange.mockClear();

    fireEvent.click(screen.getByLabelText("Clear search"));
    // clearing is deliberate, so it must not wait for the debounce
    expect(onSearchChange).toHaveBeenCalledWith("");

    settle();
    expect(onSearchChange).toHaveBeenCalledTimes(1);
    expect(input().value).toBe("");
  });

  it("syncs the field when the value changes from the outside", () => {
    const { rerender, props } = renderBar();

    type("local");
    // simulating Clear all / chip removal / browser navigation
    rerender(<ControlsBar {...props} searchQuery="from-url" />);

    expect(input().value).toBe("from-url");
  });

  it("does not debounce the filter dropdowns", () => {
    const { onStatusChange } = renderBar();

    fireEvent.click(screen.getByRole("button", { name: /status/i }));
    fireEvent.click(screen.getByRole("option", { name: "In Progress" }));

    // discrete clicks should fire straight away
    expect(onStatusChange).toHaveBeenCalledWith("in_progress");
  });
});

describe("search request volume", () => {
  beforeEach(() => {
    vi.mocked(api.fetchRequests).mockResolvedValue(emptyPage);
  });

  it("sends one request for a burst of keystrokes, not one per keystroke", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <RequestsListPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const field = await screen.findByLabelText("Search requests");
    await waitFor(() => expect(api.fetchRequests).toHaveBeenCalled());

    const before = vi.mocked(api.fetchRequests).mock.calls.length;

    for (const value of ["s", "st", "str", "stri", "strip", "stripe"]) {
      fireEvent.change(field, { target: { value } });
    }

    // still pending, nothing sent yet
    expect(
      vi.mocked(api.fetchRequests).mock.calls.length - before,
    ).toBe(0);

    await waitFor(
      () =>
        expect(vi.mocked(api.fetchRequests).mock.calls.length - before).toBe(1),
      { timeout: 2000 },
    );

    const searches = vi.mocked(api.fetchRequests).mock.calls
      .slice(before)
      .map((call) => call[0].search);
    expect(searches).toEqual(["stripe"]);
  });
});
