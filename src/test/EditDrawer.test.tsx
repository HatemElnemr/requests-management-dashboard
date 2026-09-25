import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { EditDrawer } from "@/features/requests/components/EditDrawer";
import {
  PRIORITIES,
  STATUSES,
  STATUS_LABELS,
  PRIORITY_LABELS,
} from "@/features/requests/data/MockRequests";
import { makeRequest } from "@/test/factories";
import type { RequestItem } from "@/features/requests/types/requests";

let onSave: Mock<(request: RequestItem) => void>;
let onClose: Mock<() => void>;
let request: RequestItem;

function renderDrawer(isSaving = false) {
  return render(
    <EditDrawer
      request={request}
      statuses={STATUSES}
      priorities={PRIORITIES}
      onSave={onSave}
      onClose={onClose}
      isSaving={isSaving}
    />,
  );
}

// handleSubmit in react-hook-form د async، فننتظر داخل act
// حتى تنتهي الـ validation وتُحدَّث الحالة قبلAssertion
const click = (element: Element) =>
  act(async () => {
    fireEvent.click(element);
  });

const change = (element: Element, value: string) =>
  act(async () => {
    fireEvent.change(element, { target: { value } });
  });

const blur = (element: Element) =>
  act(async () => {
    fireEvent.blur(element);
  });

const dirtyBar = () => screen.queryByText("You have unsaved changes");
const revertBtn = () => screen.queryByRole("button", { name: "Revert" });
const saveBtn = () => screen.queryByRole("button", { name: /Save Changes/ });
const closeFooterBtn = () => screen.queryByRole("button", { name: "Close" });
const xBtn = () => screen.getByRole("button", { name: "Close drawer" });
const dialog = () => screen.queryByRole("alertdialog");
const byText = (pattern: RegExp | string) => screen.queryByText(pattern);

const titleField = () => screen.getByLabelText("Title") as HTMLInputElement;
const ownerField = () => screen.getByLabelText("Owner") as HTMLInputElement;
const statusField = () => screen.getByLabelText("Status") as HTMLSelectElement;
const priorityField = () => screen.getByLabelText("Priority") as HTMLSelectElement;

beforeEach(() => {
  onSave = vi.fn<(request: RequestItem) => void>();
  onClose = vi.fn<() => void>();
  request = makeRequest({
    id: "REQ-500",
    title: "Original title",
    owner: "Original Owner",
    ownerInitials: "OO",
    status: "open",
    priority: "high",
    createdAt: "2026-05-01T00:00:00.000Z",
    updatedAt: "2026-05-02T00:00:00.000Z",
  });
});

describe("EditDrawer initial state", () => {
  it("seeds the fields from the request", () => {
    renderDrawer();
    expect(titleField().value).toBe("Original title");
    expect(ownerField().value).toBe("Original Owner");
    expect(statusField().value).toBe("open");
    expect(priorityField().value).toBe("high");
  });

  it("shows humanized labels in the selects", () => {
    renderDrawer();
    expect(statusField().textContent).toContain(STATUS_LABELS.open);
    expect(priorityField().textContent).toContain(PRIORITY_LABELS.high);
  });

  it("starts clean with a Close action and no discard dialog", () => {
    renderDrawer();
    expect(dirtyBar()).toBeNull();
    expect(saveBtn()).toBeNull();
    expect(revertBtn()).toBeNull();
    expect(closeFooterBtn()).not.toBeNull();
    expect(dialog()).toBeNull();
  });

  it("shows the request id and timestamps", () => {
    renderDrawer();
    expect(screen.getAllByText("REQ-500").length).toBeGreaterThan(0);
    expect(byText("2026-05-01T00:00:00.000Z")).not.toBeNull();
  });
});

describe("EditDrawer unsaved changes", () => {
  it("marks the form dirty when the title changes", async () => {
    renderDrawer();
    await change(titleField(), "New title");

    expect(dirtyBar()).not.toBeNull();
    expect(saveBtn()).not.toBeNull();
    expect(revertBtn()).not.toBeNull();
    expect(closeFooterBtn()).toBeNull();
  });

  it("keeps the field responsive while typing", async () => {
    renderDrawer();
    await change(titleField(), "New title");
    expect(titleField().value).toBe("New title");
  });

  it("marks the form dirty when the status changes", async () => {
    renderDrawer();
    await change(statusField(), "completed");

    expect(dirtyBar()).not.toBeNull();
    expect(statusField().value).toBe("completed");
  });

  it("marks the form dirty when the priority changes", async () => {
    renderDrawer();
    await change(priorityField(), "urgent");
    expect(dirtyBar()).not.toBeNull();
  });

  it("marks the form dirty when the owner changes", async () => {
    renderDrawer();
    await change(ownerField(), "Someone Else");
    expect(dirtyBar()).not.toBeNull();
  });

  it("stays clean when a field is changed back to its original value", async () => {
    renderDrawer();
    await change(titleField(), "Something else");
    expect(dirtyBar()).not.toBeNull();

    await change(titleField(), "Original title");
    expect(dirtyBar()).toBeNull();
    expect(closeFooterBtn()).not.toBeNull();
  });

  it("revert restores every field and clears the dirty state", async () => {
    renderDrawer();
    await change(titleField(), "New title");
    await change(ownerField(), "New Owner");
    await change(statusField(), "canceled");
    await change(priorityField(), "low");

    await click(revertBtn()!);

    expect(titleField().value).toBe("Original title");
    expect(ownerField().value).toBe("Original Owner");
    expect(statusField().value).toBe("open");
    expect(priorityField().value).toBe("high");
    expect(dirtyBar()).toBeNull();
  });
});

describe("EditDrawer close guards", () => {
  it("asks for confirmation instead of closing when dirty", async () => {
    renderDrawer();
    await change(titleField(), "New title");

    await click(xBtn());

    expect(dialog()).not.toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("keeps editing dismisses the dialog and stays dirty", async () => {
    renderDrawer();
    await change(titleField(), "New title");
    await click(xBtn());

    await click(screen.getByRole("button", { name: "Keep editing" }));

    expect(dialog()).toBeNull();
    expect(dirtyBar()).not.toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("discard changes closes without saving", async () => {
    renderDrawer();
    await change(titleField(), "New title");
    await click(xBtn());

    await click(screen.getByRole("button", { name: "Discard changes" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("closes immediately when the form is clean", async () => {
    renderDrawer();
    await click(xBtn());

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(dialog()).toBeNull();
  });

  it("closes from the footer Close when clean", async () => {
    renderDrawer();
    await click(closeFooterBtn()!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("guards the backdrop click too", async () => {
    const { container } = renderDrawer();
    await change(titleField(), "New title");

    await click(container.querySelector('[aria-hidden="true"]')!);

    expect(dialog()).not.toBeNull();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("EditDrawer validation", () => {
  it("blocks saving an empty title", async () => {
    renderDrawer();
    await change(titleField(), "");
    await blur(titleField());

    expect(byText(/Title is required/)).not.toBeNull();
    expect(titleField().getAttribute("aria-invalid")).toBe("true");

    await click(saveBtn()!);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("blocks saving a whitespace-only title", async () => {
    renderDrawer();
    await change(titleField(), "   ");
    await blur(titleField());

    expect(byText(/Title cannot be only spaces/)).not.toBeNull();
    await click(saveBtn()!);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("blocks saving an empty owner", async () => {
    renderDrawer();
    await change(ownerField(), "");
    await blur(ownerField());

    expect(byText(/Owner is required/)).not.toBeNull();
    await click(saveBtn()!);
    expect(onSave).not.toHaveBeenCalled();
  });

  it("clears the error once the field becomes valid", async () => {
    renderDrawer();
    await change(titleField(), "");
    await blur(titleField());
    expect(byText(/Title is required/)).not.toBeNull();

    await change(titleField(), "Valid");
    await blur(titleField());
    expect(byText(/Title is required/)).toBeNull();
  });
});

describe("EditDrawer saving", () => {
  it("sends the merged request and preserves untouched fields", async () => {
    renderDrawer();
    await change(titleField(), "New title");
    await change(statusField(), "completed");

    await click(saveBtn()!);

    expect(onSave).toHaveBeenCalledTimes(1);
    const saved = onSave.mock.calls[0][0] as RequestItem;
    expect(saved.title).toBe("New title");
    expect(saved.status).toBe("completed");
    expect(saved.owner).toBe("Original Owner");
    expect(saved.priority).toBe("high");
    expect(saved.id).toBe("REQ-500");
    expect(saved.createdAt).toBe("2026-05-01T00:00:00.000Z");
  });

  it("keeps the original ownerInitials rather than recomputing them", async () => {
    renderDrawer();
    await change(ownerField(), "Zoe Adams");

    await click(saveBtn()!);

    const saved = onSave.mock.calls[0][0] as RequestItem;
    // initials are the old owner's until the store recalculates them
    expect(saved.ownerInitials).toBe("OO");
  });

  it("saves on Enter inside the form", async () => {
    renderDrawer();
    await change(titleField(), "Keyboard save");

    const form = titleField().closest("form");
    expect(form).not.toBeNull();

    await act(async () => {
      fireEvent.submit(form!);
    });

    expect(onSave).toHaveBeenCalledTimes(1);
    expect((onSave.mock.calls[0][0] as RequestItem).title).toBe("Keyboard save");
  });

  it("disables saving and shows progress while saving", async () => {
    const { container } = renderDrawer(true);
    await change(titleField(), "New title");

    // التسمية تتحوّل إلى "Saving…" أثناء الحفظ
    const button = container.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(button).not.toBeNull();
    expect(button.disabled).toBe(true);
    expect(button.textContent).toContain("Saving");
  });
});
