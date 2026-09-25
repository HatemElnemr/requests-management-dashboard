import { useSearchParams } from "react-router-dom";
import { PRIORITIES, STATUSES, SORT_OPTIONS } from "../data/MockRequests";
import type { RequestFilters, RequestSortBy } from "../types/requests";

const SORT_VALUES: readonly RequestSortBy[] = SORT_OPTIONS.map((o) => o.value);

function isOneOf<T extends string>(list: readonly T[], value: string | null): value is T {
  return value !== null && (list as readonly string[]).includes(value);
}

const DEFAULT_SORT: RequestSortBy = "updatedAt";

function positiveInt(value: string | null, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function useRequestParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  // نتحقق من كل قيمة القادمة من الـ URL بدل الـ cast المباشر
  // حتى لا تمرير ?status=foo غير صحيح وتكسر الفلترة
  const rawStatus = searchParams.get("status");
  const rawPriority = searchParams.get("priority");
  const rawSortBy = searchParams.get("sortBy");

  const filters: RequestFilters = {
    page: positiveInt(searchParams.get("page"), 1),
    limit: positiveInt(searchParams.get("limit"), 5),
    search: searchParams.get("search") ?? "",
    status: isOneOf(STATUSES, rawStatus) ? rawStatus : "",
    priority: isOneOf(PRIORITIES, rawPriority) ? rawPriority : "",
    sortBy: isOneOf(SORT_VALUES, rawSortBy) ? rawSortBy : DEFAULT_SORT,
  };

  const setFilter = <K extends keyof RequestFilters>(key: K, value: RequestFilters[K]) => {
    const next = new URLSearchParams(searchParams);

    // القيم الفاضية لا تُحفظ في الـ URL
    if (value === "" || value === undefined || value === null) {
      next.delete(key);
    } else {
      next.set(key, String(value));
    }

    // أي تغيير في الفلاتر يرجّعنا للصفحة الأولى
    if (key !== "page") {
      next.set("page", "1");
    }

    setSearchParams(next, { replace: true });
  };

  const resetFilters = () => {
    setSearchParams(new URLSearchParams(), { replace: true });
  };

  return { filters, setFilter, resetFilters };
}
