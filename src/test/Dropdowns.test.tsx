import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterDropdown, SortDropdown } from "@/components/ui/Dropdowns";
import { STATUS_SELECT_OPTIONS, SORT_OPTIONS } from "@/features/requests/data/MockRequests";

const statuses = STATUS_SELECT_OPTIONS;
const sorts = SORT_OPTIONS;

function renderFilter(overrides: Partial<Parameters<typeof FilterDropdown>[0]> = {}) {
  const onChange = vi.fn();
  const props = {
    label: "Status",
    options: statuses,
    onChange,
    ...overrides,
  };
  return { onChange, ...render(<FilterDropdown {...props} />) };
}

function renderSort(overrides: Partial<Parameters<typeof SortDropdown>[0]> = {}) {
  const onChange = vi.fn();
  const props = {
    options: sorts,
    value: "updatedAt",
    onChange,
    ...overrides,
  };
  return { onChange, ...render(<SortDropdown {...props} />) };
}

const trigger = (name: RegExp) => screen.getByRole("button", { name });
const listbox = () => screen.queryByRole("listbox");

describe("FilterDropdown", () => {
  it("starts closed", () => {
    renderFilter();
    expect(listbox()).toBeNull();
    expect(trigger(/status/i).getAttribute("aria-expanded")).toBe("false");
  });

  it("opens on click and lists every option", () => {
    renderFilter();
    fireEvent.click(trigger(/status/i));

    expect(listbox()).not.toBeNull();
    expect(trigger(/status/i).getAttribute("aria-expanded")).toBe("true");
    for (const option of statuses) {
      expect(screen.getByRole("option", { name: option.label })).toBeTruthy();
    }
  });

  it("toggles closed on a second click", () => {
    renderFilter();
    fireEvent.click(trigger(/status/i));
    fireEvent.click(trigger(/status/i));
    expect(listbox()).toBeNull();
  });

  it("reports the chosen value and closes", () => {
    const { onChange } = renderFilter();
    fireEvent.click(trigger(/status/i));

    fireEvent.click(screen.getByRole("option", { name: "In Progress" }));

    expect(onChange).toHaveBeenCalledWith("in_progress");
    expect(listbox()).toBeNull();
  });

  it("clears the filter through the All option", () => {
    const { onChange } = renderFilter({ value: "open" });
    fireEvent.click(trigger(/status/i));

    fireEvent.click(screen.getByRole("option", { name: /All Status/ }));

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("shows the selected label in the trigger", () => {
    renderFilter({ value: "in_progress" });
    expect(trigger(/status/i).textContent).toContain("In Progress");
  });

  it("shows the generic label when nothing is selected", () => {
    renderFilter({ value: "" });
    expect(trigger(/status/i).textContent).not.toContain("Status:");
  });

  it("marks the selected option", () => {
    renderFilter({ value: "completed" });
    fireEvent.click(trigger(/status/i));
    expect(screen.getByRole("option", { name: "Completed" }).getAttribute("aria-selected")).toBe("true");
  });

  it("closes when clicking outside", () => {
    renderFilter();
    fireEvent.click(trigger(/status/i));

    fireEvent.pointerDown(document.body);

    expect(listbox()).toBeNull();
  });

  it("stays open when clicking inside", () => {
    renderFilter();
    fireEvent.click(trigger(/status/i));

    fireEvent.pointerDown(listbox()!);

    expect(listbox()).not.toBeNull();
  });

  it("closes on Escape", () => {
    renderFilter();
    fireEvent.click(trigger(/status/i));

    fireEvent.keyDown(document, { key: "Escape" });

    expect(listbox()).toBeNull();
  });
});

describe("SortDropdown", () => {
  it("starts closed and shows the current sort", () => {
    renderSort();
    expect(listbox()).toBeNull();
    expect(trigger(/sort/i).textContent).toContain("Updated At");
  });

  it("offers every sort option", () => {
    renderSort();
    fireEvent.click(trigger(/sort/i));

    for (const option of sorts) {
      expect(screen.getByRole("option", { name: option.label })).toBeTruthy();
    }
  });

  it("reports the chosen sort and closes", () => {
    const { onChange } = renderSort();
    fireEvent.click(trigger(/sort/i));

    fireEvent.click(screen.getByRole("option", { name: "Priority" }));

    expect(onChange).toHaveBeenCalledWith("priority");
    expect(listbox()).toBeNull();
  });

  it("closes on Escape", () => {
    renderSort();
    fireEvent.click(trigger(/sort/i));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(listbox()).toBeNull();
  });

  it("closes when clicking outside", () => {
    renderSort();
    fireEvent.click(trigger(/sort/i));
    fireEvent.pointerDown(document.body);
    expect(listbox()).toBeNull();
  });
});
