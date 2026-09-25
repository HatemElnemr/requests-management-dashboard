// تحدد الحالات المتاحة فقط لمنع كتابة أي كلمة خطأ
export type RequestStatus = "open" | "in_progress" | "completed" | "canceled";
export type RequestPriority = "low" | "medium" | "high" | "urgent";

// مفاتيح الترتيب المتاحة، تُستخدم في الفلاتر والـ URL
export type RequestSortBy = "createdAt" | "updatedAt" | "priority" | "status";

// الشكل الأساسي للـ Request
export interface RequestItem {
  id: string;
  title: string;
  status: RequestStatus;
  priority: RequestPriority;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  createdAt: string;
  updatedAt: string;
}

// الفلاتر التي نرسلها للـ API ونحفظها في الـ URL
export interface RequestFilters {
  page: number;
  limit: number;
  search: string;
  status: RequestStatus | "";
  priority: RequestPriority | "";
  sortBy: RequestSortBy;
}

// شكل الـ Response القادم من الـ API
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  totalPages: number;
}

export interface FilterChip {
  id: string;
  label: string;
}

// خيار عام للـ dropdowns (القيمة المخزنة والـ label المعروض)
export interface SelectOption {
  value: string;
  label: string;
}

// خيار الترتيب، قيمته محصورة في RequestSortBy لأنها تُحفظ في الـ URL
export interface SortOption {
  value: RequestSortBy;
  label: string;
}
