import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteRequest,
  fetchRequests,
  updateRequest,
  updateRequestStatus,
} from "../api/RequestsApi";
import type { PaginatedResponse, RequestFilters, RequestItem, RequestStatus } from "../types/requests";

const REQUESTS_KEY = ["requests"] as const;

export function useRequests(filters: RequestFilters) {
  return useQuery<PaginatedResponse<RequestItem>, Error>({
    queryKey: [...REQUESTS_KEY, filters],
    queryFn: () => fetchRequests(filters),
    // نعيد المحاولة لأن الفشل هنا عشوائي بنسبة 5% فقط
    retry: 2,
    refetchInterval: 10000,
  });
}

// نمسح كل الصفحات المخزنة مؤقتاً (لأنها تعتمد على الفلاتر)
function invalidate() {
  return { queryKey: REQUESTS_KEY } as const;
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RequestStatus }) =>
      updateRequestStatus(id, status),
    // تحديث متفائل: نعدّل الـ cache فوراً قبل وصول رد الـ API
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries(invalidate());
      const previous = queryClient.getQueriesData<PaginatedResponse<RequestItem>>(invalidate());

      queryClient.setQueriesData<PaginatedResponse<RequestItem>>(invalidate(), (old) =>
        old
          ? {
              ...old,
              data: old.data.map((r) =>
                r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r,
              ),
            }
          : old,
      );

      return { previous };
    },
    // عند الفشل نرجع الـ cache لوضعه السابق
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries(invalidate()),
  });
}

export function useUpdateRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updated: RequestItem) => updateRequest(updated),
    onMutate: async (updated) => {
      await queryClient.cancelQueries(invalidate());
      const previous = queryClient.getQueriesData<PaginatedResponse<RequestItem>>(invalidate());

      queryClient.setQueriesData<PaginatedResponse<RequestItem>>(invalidate(), (old) =>
        old
          ? {
              ...old,
              data: old.data.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)),
            }
          : old,
      );

      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries(invalidate()),
  });
}

export function useDeleteRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteRequest(id),
    onMutate: async ({ id }) => {
      await queryClient.cancelQueries(invalidate());
      const previous = queryClient.getQueriesData<PaginatedResponse<RequestItem>>(invalidate());

      queryClient.setQueriesData<PaginatedResponse<RequestItem>>(invalidate(), (old) => {
        if (!old) return old;
        const data = old.data.filter((r) => r.id !== id);
        return { ...old, data, total: Math.max(0, old.total - 1) };
      });

      return { previous };
    },
    onError: (_error, _vars, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => queryClient.invalidateQueries(invalidate()),
  });
}
