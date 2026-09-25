import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ActiveFilters } from "@/features/requests/components/ActiveFilters";
import { InlineStatusSelect } from "@/features/requests/components/InlineStatusSelect";
import { DiscardDialog } from "@/features/requests/components/DiscardDialog";
import { STATUSES } from "@/features/requests/data/MockRequests";
import type { FilterChip } from "@/features/requests/types/requests";

const chips: FilterChip[] = [
  { id: "search", label: "Search: stripe" },
  { id: "status", label: "Status: In Progress" },
];

describe("ActiveFilters", () => {
  it("renders nothing when there are no filters", () => {
    const { container } = render(
      <ActiveFilters filters={[]} onRemove={vi.fn()} onClearAll={vi.fn()} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders one control per filter", () => {
    render(
      <ActiveFilters filters={chips} onRemove={vi.fn()} onClearAll={vi.fn()} />,
    );
    expect(screen.getByText("Search: stripe")).toBeTruthy();
    expect(screen.getByText("Status: In Progress")).toBeTruthy();
  });

  it("removes the clicked filter by id", () => {
    const onRemove = vi.fn();
    render(
      <ActiveFilters filters={chips} onRemove={onRemove} onClearAll={vi.fn()} />,
    );

    fireEvent.click(screen.getByLabelText("Remove filter Search: stripe"));

    expect(onRemove).toHaveBeenCalledWith("search");
  });

  it("clears every filter", () => {
    const onClearAll = vi.fn();
    render(
      <ActiveFilters filters={chips} onRemove={vi.fn()} onClearAll={onClearAll} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Clear all" }));

    expect(onClearAll).toHaveBeenCalledTimes(1);
  });
});

describe("InlineStatusSelect", () => {
  it("shows the current status", () => {
    render(
      <InlineStatusSelect value="in_progress" statuses={STATUSES} onChange={vi.fn()} />,
    );
    expect(screen.getByRole("button").textContent).toContain("in_progress");
  });

  it("starts closed and opens on click", () => {
    render(
      <InlineStatusSelect value="open" statuses={STATUSES} onChange={vi.fn()} />,
    );
    expect(screen.queryByRole("listbox")).toBeNull();

    fireEvent.click(screen.getByRole("button"));

    expect(screen.getByRole("listbox")).not.toBeNull();
  });

  it("lists every status", () => {
    render(
      <InlineStatusSelect value="open" statuses={STATUSES} onChange={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button"));

    for (const status of STATUSES) {
      expect(screen.getByRole("option", { name: new RegExp(status) })).toBeTruthy();
    }
  });

  it("reports the new status and closes", () => {
    const onChange = vi.fn();
    render(
      <InlineStatusSelect value="open" statuses={STATUSES} onChange={onChange} />,
    );
    fireEvent.click(screen.getByRole("button"));

    fireEvent.click(screen.getByRole("option", { name: /completed/ }));

    expect(onChange).toHaveBeenCalledWith("completed");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("works without an onChange handler", () => {
    render(<InlineStatusSelect value="open" statuses={STATUSES} />);
    fireEvent.click(screen.getByRole("button"));
    fireEvent.click(screen.getByRole("option", { name: /completed/ }));
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("does not open when disabled", () => {
    render(
      <InlineStatusSelect
        value="open"
        statuses={STATUSES}
        onChange={vi.fn()}
        disabled
      />,
    );
    const button = screen.getByRole("button");
    expect((button as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(button);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("closes on outside click", () => {
    render(
      <InlineStatusSelect value="open" statuses={STATUSES} onChange={vi.fn()} />,
    );
    fireEvent.click(screen.getByRole("button"));
    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("DiscardDialog", () => {
  it("reports keeping the edits", () => {
    const onKeepEditing = vi.fn();
    render(
      <DiscardDialog onKeepEditing={onKeepEditing} onDiscard={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Keep editing" }));

    expect(onKeepEditing).toHaveBeenCalledTimes(1);
  });

  it("reports discarding the edits", () => {
    const onDiscard = vi.fn();
    render(
      <DiscardDialog onKeepEditing={vi.fn()} onDiscard={onDiscard} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Discard changes" }));

    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it("is announced as an alert dialog", () => {
    render(<DiscardDialog onKeepEditing={vi.fn()} onDiscard={vi.fn()} />);
    expect(screen.getByRole("alertdialog")).toBeTruthy();
  });
});
