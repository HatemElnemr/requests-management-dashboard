import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useRequestParams } from "@/features/requests/hooks/useRequestParams";
import { useRequests } from "@/features/requests/hooks/useRequests";
import { useUpdateRequest } from "@/features/requests/hooks/useRequests";
import * as api from "@/features/requests/api/RequestsApi";
import { createWrapper } from "@/test/utils";
import type {
  PaginatedResponse,
  RequestFilters,
  RequestItem,
} from "@/features/requests/types/requests";

// لازم نعمل Mock للوحدة الحقيقية "@/features/requests/api/RequestsApi"
// لأن vi.mocked لا يحوّل الدالة إلى mock فعلياً وقت التشغيل،
// بل هو مجرد أداة مساعدة على مستوى الأنواع في TypeScript.
// وvi.mock يرفع الكود للأعلى، لذا يجب أن يسبق الاستيراد في الترتيب النصي.
vi.mock("@/features/requests/api/RequestsApi", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/features/requests/api/RequestsApi")>();
  return {
    ...actual,
    fetchRequests: vi.fn(),
    updateRequest: vi.fn(),
    updateRequestStatus: vi.fn(),
    deleteRequest: vi.fn(),
  };
});

const mockData: PaginatedResponse<RequestItem> = {
  data: [
    {
      id: "REQ-1",
      title: "Fix Bug",
      status: "open",
      priority: "high",
      owner: "Ahmed",
      ownerInitials: "AH",
      ownerColor: "#000",
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
  ],
  total: 1,
  totalPages: 1,
};

const baseFilters: RequestFilters = {
  page: 1,
  limit: 5,
  search: "",
  status: "",
  priority: "",
  sortBy: "createdAt",
};

describe("Requests Hooks System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------
  // Test 1: اختبار الـ URL Params Hook (الخطوة الأولى)
  // -------------------------------------------------------------
  it("1. should read filters from URL and update URL when setFilter is called", () => {
    // القيم لازم تكون snake_case ومطابقة لـ RequestStatus
    // ("Open" غير صالح ويرفضها الـ validation فينتهي إلى "")
    const wrapper = createWrapper(["/?page=2&status=in_progress"]);
    const { result } = renderHook(() => useRequestParams(), { wrapper });

    // التأكد من قراءة البيانات من الـ URL صح
    expect(result.current.filters.page).toBe(2);
    expect(result.current.filters.status).toBe("in_progress");

    // تغيير البحث والتأكد من إعادة الصفحة لرقم 1
    act(() => {
      result.current.setFilter("search", "Auth");
    });

    expect(result.current.filters.search).toBe("Auth");
    expect(result.current.filters.page).toBe(1);
  });

  it("1b. should reject an invalid status coming from the URL", () => {
    const wrapper = createWrapper(["/?status=Open"]);
    const { result } = renderHook(() => useRequestParams(), { wrapper });

    expect(result.current.filters.status).toBe("");
  });

  // -------------------------------------------------------------
  // Test 2: اختبار جلب البيانات بـ React Query (الخطوة الثانية)
  // -------------------------------------------------------------
  it("2. should fetch requests data successfully", async () => {
    vi.mocked(api.fetchRequests).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useRequests(baseFilters), {
      wrapper: createWrapper(),
    });

    // الانتظار لحين انتهاء الجلب
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data[0].title).toBe("Fix Bug");
    expect(api.fetchRequests).toHaveBeenCalledWith(baseFilters);
  });

  // -------------------------------------------------------------
  // Test 3: اختبار الـ Optimistic Update والـ Rollback (الخطوة الثالثة)
  // -------------------------------------------------------------
  it("3. should perform optimistic update immediately and rollback on API error", async () => {
    // First call returns data; later calls (the onSettled refetch) hang on
    // purpose so the refetch cannot mask the rollback and make this
    // assertion pass for the wrong reason.
    vi.mocked(api.fetchRequests)
      .mockResolvedValueOnce(mockData)
      .mockImplementation(() => new Promise(() => {}));

    // Deferred rejection so the optimistic state stays observable.
    let rejectUpdate!: (reason: Error) => void;
    vi.mocked(api.updateRequest).mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectUpdate = reject;
        }),
    );

    const wrapper = createWrapper();

    // جلب البيانات الأساسية أولاً في الـ Cache
    const { result: queryResult } = renderHook(() => useRequests(baseFilters), { wrapper });
    await waitFor(() => expect(queryResult.current.isSuccess).toBe(true));

    // استدعاء Mutation Hook
    const { result: mutationResult } = renderHook(() => useUpdateRequest(), { wrapper });

    const updatedItem: RequestItem = {
      ...mockData.data[0],
      status: "completed",
    };

    // sync act (not async): onMutate awaits cancelQueries, so an async act
    // would exit before the cache write lands and the observer would update
    // outside of act, leaving result.current stale
    act(() => {
      mutationResult.current.mutate(updatedItem);
    });

    // التحقق التفاؤلي: الكاش تغيّر قبل رد الـ API (ما زال الـ request معلقاً).
    // الـ waitFor هنا آمن لأن الـ mutation لا يمكن أن تفشل قبل rejectUpdate.
    await waitFor(() =>
      expect(queryResult.current.data?.data[0].status).toBe("completed"),
    );
    expect(mutationResult.current.isPending).toBe(true);

    // الآن نسمح بالفشل ونتحقق من رجوع الكاش للحالة القديمة.
    // الـ refetch المعلق يعني أن "open" هنا لا يمكن أن تأتي إلا من rollback.
    await act(async () => {
      rejectUpdate(new Error("Server Error"));
    });

    await waitFor(() =>
      expect(queryResult.current.data?.data[0].status).toBe("open"),
    );
  });
});
