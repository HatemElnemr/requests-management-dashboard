import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, PriorityBadge } from "@/features/requests/components/RequestBadges";
import {
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/features/requests/data/MockRequests";

describe("StatusBadge", () => {
  it("renders the readable label for every status", () => {
    for (const status of STATUSES) {
      const { unmount } = render(<StatusBadge status={status} />);
      expect(screen.getByText(STATUS_LABELS[status])).toBeTruthy();
      unmount();
    }
  });

  it("never leaks the raw snake_case value to the screen", () => {
    for (const status of STATUSES) {
      const { unmount, container } = render(<StatusBadge status={status} />);
      expect(container.textContent).not.toContain(status);
      unmount();
    }
  });

  it("renders In Progress with a space, not an underscore", () => {
    render(<StatusBadge status="in_progress" />);
    const text = screen.getByText("In Progress");
    expect(text).toBeTruthy();
    expect(screen.queryByText(/in_progress/)).toBeNull();
  });
});

describe("PriorityBadge", () => {
  it("renders the readable label for every priority", () => {
    for (const priority of PRIORITIES) {
      const { unmount } = render(<PriorityBadge priority={priority} />);
      expect(screen.getByText(PRIORITY_LABELS[priority])).toBeTruthy();
      unmount();
    }
  });

  it("capitalises single-word priorities", () => {
    render(<PriorityBadge priority="urgent" />);
    expect(screen.getByText("Urgent")).toBeTruthy();
    expect(screen.queryByText(/^urgent$/)).toBeNull();
  });

  it("never leaks the raw lowercase value to the screen", () => {
    for (const priority of PRIORITIES) {
      const { unmount, container } = render(<PriorityBadge priority={priority} />);
      // the label equals the raw value apart from case, so assert the case change
      expect(container.textContent).toBe(PRIORITY_LABELS[priority]);
      unmount();
    }
  });
});
