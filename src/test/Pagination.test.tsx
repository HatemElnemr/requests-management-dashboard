import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Pagination } from "@/components/ui/Pagination";

function renderPagination(overrides: Partial<Parameters<typeof Pagination>[0]> = {}) {
  const onPageChange = vi.fn();
  const props = {
    start: 1,
    end: 5,
    totalResults: 24,
    currentPage: 1,
    totalPages: 5,
    onPageChange,
    ...overrides,
  };
  return { onPageChange, ...render(<Pagination {...props} />) };
}

const pageButtons = () =>
  screen
    .queryAllByRole("button")
    .filter((b) => /^\d+$/.test(b.textContent?.trim() ?? ""));

describe("Pagination summary", () => {
  it("shows the result range", () => {
    renderPagination({ start: 6, end: 10, totalResults: 24 });
    expect(screen.getByText(/Showing/).textContent).toContain("6");
    expect(screen.getByText(/Showing/).textContent).toContain("10");
    expect(screen.getByText(/Showing/).textContent).toContain("24");
  });

  it("renders nothing when there are no results", () => {
    const { container } = renderPagination({ totalResults: 0, start: 0, end: 0 });
    expect(container.innerHTML).toBe("");
  });
});

describe("Pagination navigation", () => {
  it("disables previous on the first page", () => {
    renderPagination({ currentPage: 1 });
    expect((screen.getByLabelText("Previous page") as HTMLButtonElement).disabled).toBe(true);
  });

  it("disables next on the last page", () => {
    renderPagination({ currentPage: 5, totalPages: 5 });
    expect((screen.getByLabelText("Next page") as HTMLButtonElement).disabled).toBe(true);
  });

  it("enables both in the middle", () => {
    renderPagination({ currentPage: 3, totalPages: 5 });
    expect((screen.getByLabelText("Previous page") as HTMLButtonElement).disabled).toBe(false);
    expect((screen.getByLabelText("Next page") as HTMLButtonElement).disabled).toBe(false);
  });

  it("requests the previous page", () => {
    const { onPageChange } = renderPagination({ currentPage: 3 });
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("requests the next page", () => {
    const { onPageChange } = renderPagination({ currentPage: 3 });
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it("requests a specific page", () => {
    const { onPageChange } = renderPagination({ currentPage: 1 });
    fireEvent.click(screen.getByRole("button", { name: "3" }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("does not navigate from a disabled button", () => {
    const { onPageChange } = renderPagination({ currentPage: 1 });
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("marks the active page for assistive tech", () => {
    renderPagination({ currentPage: 3 });
    expect(screen.getByRole("button", { name: "3" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("button", { name: "2" }).getAttribute("aria-current")).toBeNull();
  });
});

describe("Pagination page window", () => {
  it("lists every page when the total is small", () => {
    renderPagination({ currentPage: 1, totalPages: 5 });
    expect(pageButtons().map((b) => b.textContent)).toEqual(["1", "2", "3", "4", "5"]);
    expect(screen.queryByText("…")).toBeNull();
  });

  it("collapses distant pages behind an ellipsis", () => {
    renderPagination({ currentPage: 1, totalPages: 10 });
    const labels = pageButtons().map((b) => b.textContent);
    expect(labels).toEqual(["1", "2", "10"]);
    expect(screen.getByText("…")).toBeTruthy();
  });

  it("keeps a window around the current page", () => {
    renderPagination({ currentPage: 5, totalPages: 10 });
    const labels = pageButtons().map((b) => b.textContent);
    expect(labels).toEqual(["1", "4", "5", "6", "10"]);
  });

  it("still lists the last page when on the final page", () => {
    renderPagination({ currentPage: 10, totalPages: 10 });
    const labels = pageButtons().map((b) => b.textContent);
    expect(labels).toEqual(["1", "9", "10"]);
    expect((screen.getByLabelText("Next page") as HTMLButtonElement).disabled).toBe(true);
  });

  it("handles a single page", () => {
    renderPagination({ currentPage: 1, totalPages: 1 });
    expect(pageButtons().map((b) => b.textContent)).toEqual(["1"]);
    expect((screen.getByLabelText("Previous page") as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByLabelText("Next page") as HTMLButtonElement).disabled).toBe(true);
  });
});
