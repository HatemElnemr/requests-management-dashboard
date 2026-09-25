import type {
  RequestItem,
  RequestStatus,
  RequestPriority,
  SelectOption,
  SortOption,
} from "@/features/requests/types/requests";

// Helper function to extract initials from full name (e.g., "Ahmed Hassan" -> "AH")
export const getInitials = (name: string): string => {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Helper function to generate a consistent color per owner based on their name hash
export const getOwnerColor = (name: string): string => {
  const colors = [
    "#2563EB", // Blue
    "#059669", // Emerald
    "#D97706", // Amber
    "#7C3AED", // Purple
    "#DB2777", // Pink
    "#0284C7", // Sky
    "#4F46E5", // Indigo
    "#DC2626", // Red
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

export const INITIAL_MOCK_REQUESTS: RequestItem[] = [
  {
    id: "REQ-101",
    title: "Fix Auth Token Refresh Bug",
    status: "open",
    priority: "urgent",
    owner: "Ahmed Hassan",
    ownerInitials: getInitials("Ahmed Hassan"),
    ownerColor: getOwnerColor("Ahmed Hassan"),
    createdAt: "2026-09-01T10:30:00Z",
    updatedAt: "2026-09-02T12:00:00Z",
  },
  {
    id: "REQ-102",
    title: "Update Dashboard Analytics Charts",
    status: "in_progress",
    priority: "high",
    owner: "Sara Ali",
    ownerInitials: getInitials("Sara Ali"),
    ownerColor: getOwnerColor("Sara Ali"),
    createdAt: "2026-09-03T14:15:00Z",
    updatedAt: "2026-09-05T09:30:00Z",
  },
  {
    id: "REQ-103",
    title: "Optimize Database Indexing for Requests Table",
    status: "completed",
    priority: "urgent",
    owner: "Omar Mahmoud",
    ownerInitials: getInitials("Omar Mahmoud"),
    ownerColor: getOwnerColor("Omar Mahmoud"),
    createdAt: "2026-09-04T08:00:00Z",
    updatedAt: "2026-09-10T16:45:00Z",
  },
  {
    id: "REQ-104",
    title: "Implement Dark Mode Theme Support",
    status: "canceled",
    priority: "low",
    owner: "Nour El-Din",
    ownerInitials: getInitials("Nour El-Din"),
    ownerColor: getOwnerColor("Nour El-Din"),
    createdAt: "2026-09-05T11:20:00Z",
    updatedAt: "2026-09-06T13:10:00Z",
  },
  {
    id: "REQ-105",
    title: "Add CSV Export Option for Filtered Lists",
    status: "open",
    priority: "medium",
    owner: "Mona Ibrahim",
    ownerInitials: getInitials("Mona Ibrahim"),
    ownerColor: getOwnerColor("Mona Ibrahim"),
    createdAt: "2026-09-06T16:00:00Z",
    updatedAt: "2026-09-06T16:00:00Z",
  },
  {
    id: "REQ-106",
    title: "Refactor Navigation Bar Component",
    status: "in_progress",
    priority: "low",
    owner: "Ahmed Hassan",
    ownerInitials: getInitials("Ahmed Hassan"),
    ownerColor: getOwnerColor("Ahmed Hassan"),
    createdAt: "2026-09-07T09:00:00Z",
    updatedAt: "2026-09-08T10:15:00Z",
  },
  {
    id: "REQ-107",
    title: "Fix Memory Leak in SignalR WebSocket Connection",
    status: "open",
    priority: "urgent",
    owner: "Khaled Samir",
    ownerInitials: getInitials("Khaled Samir"),
    ownerColor: getOwnerColor("Khaled Samir"),
    createdAt: "2026-09-08T13:45:00Z",
    updatedAt: "2026-09-09T08:20:00Z",
  },
  {
    id: "REQ-108",
    title: "Integrate Stripe Payment Gateway Webhooks",
    status: "completed",
    priority: "high",
    owner: "Sara Ali",
    ownerInitials: getInitials("Sara Ali"),
    ownerColor: getOwnerColor("Sara Ali"),
    createdAt: "2026-09-09T15:30:00Z",
    updatedAt: "2026-09-15T11:00:00Z",
  },
  {
    id: "REQ-109",
    title: "Set up Automated E2E Cypress Tests",
    status: "open",
    priority: "medium",
    owner: "Youssef Tarek",
    ownerInitials: getInitials("Youssef Tarek"),
    ownerColor: getOwnerColor("Youssef Tarek"),
    createdAt: "2026-09-10T10:00:00Z",
    updatedAt: "2026-09-10T10:00:00Z",
  },
  {
    id: "REQ-110",
    title: "Audit User Role Permissions System",
    status: "in_progress",
    priority: "high",
    owner: "Omar Mahmoud",
    ownerInitials: getInitials("Omar Mahmoud"),
    ownerColor: getOwnerColor("Omar Mahmoud"),
    createdAt: "2026-09-11T12:00:00Z",
    updatedAt: "2026-09-12T14:30:00Z",
  },
  {
    id: "REQ-111",
    title: "Fix Mobile Responsive Layout on Request Details View",
    status: "open",
    priority: "medium",
    owner: "Nour El-Din",
    ownerInitials: getInitials("Nour El-Din"),
    ownerColor: getOwnerColor("Nour El-Din"),
    createdAt: "2026-09-12T08:30:00Z",
    updatedAt: "2026-09-12T08:30:00Z",
  },
  {
    id: "REQ-112",
    title: "Configure Sentry Error Reporting Service",
    status: "completed",
    priority: "medium",
    owner: "Mona Ibrahim",
    ownerInitials: getInitials("Mona Ibrahim"),
    ownerColor: getOwnerColor("Mona Ibrahim"),
    createdAt: "2026-09-13T11:10:00Z",
    updatedAt: "2026-09-16T17:00:00Z",
  },
  {
    id: "REQ-113",
    title: "Update Third-Party NPM Dependencies",
    status: "canceled",
    priority: "low",
    owner: "Khaled Samir",
    ownerInitials: getInitials("Khaled Samir"),
    ownerColor: getOwnerColor("Khaled Samir"),
    createdAt: "2026-09-14T14:00:00Z",
    updatedAt: "2026-09-15T09:00:00Z",
  },
  {
    id: "REQ-114",
    title: "Implement Multi-Factor Authentication (MFA)",
    status: "in_progress",
    priority: "urgent",
    owner: "Ahmed Hassan",
    ownerInitials: getInitials("Ahmed Hassan"),
    ownerColor: getOwnerColor("Ahmed Hassan"),
    createdAt: "2026-09-15T16:20:00Z",
    updatedAt: "2026-09-18T10:00:00Z",
  },
  {
    id: "REQ-115",
    title: "Design Email Notification Templates",
    status: "completed",
    priority: "low",
    owner: "Sara Ali",
    ownerInitials: getInitials("Sara Ali"),
    ownerColor: getOwnerColor("Sara Ali"),
    createdAt: "2026-09-16T09:45:00Z",
    updatedAt: "2026-09-20T12:15:00Z",
  },
  {
    id: "REQ-116",
    title: "Fix Timezone Shift Bug in Date Pickers",
    status: "open",
    priority: "high",
    owner: "Youssef Tarek",
    ownerInitials: getInitials("Youssef Tarek"),
    ownerColor: getOwnerColor("Youssef Tarek"),
    createdAt: "2026-09-17T13:00:00Z",
    updatedAt: "2026-09-17T13:00:00Z",
  },
  {
    id: "REQ-117",
    title: "Add Keyboard Shortcuts for Quick Actions",
    status: "open",
    priority: "low",
    owner: "Nour El-Din",
    ownerInitials: getInitials("Nour El-Din"),
    ownerColor: getOwnerColor("Nour El-Din"),
    createdAt: "2026-09-18T10:15:00Z",
    updatedAt: "2026-09-18T10:15:00Z",
  },
  {
    id: "REQ-118",
    title: "Optimize Font Loading & Bundle Assets Size",
    status: "completed",
    priority: "medium",
    owner: "Omar Mahmoud",
    ownerInitials: getInitials("Omar Mahmoud"),
    ownerColor: getOwnerColor("Omar Mahmoud"),
    createdAt: "2026-09-19T07:30:00Z",
    updatedAt: "2026-09-21T15:00:00Z",
  },
  {
    id: "REQ-119",
    title: "Fix Infinite Re-render Loop in Filters Drawer",
    status: "in_progress",
    priority: "urgent",
    owner: "Khaled Samir",
    ownerInitials: getInitials("Khaled Samir"),
    ownerColor: getOwnerColor("Khaled Samir"),
    createdAt: "2026-09-20T11:00:00Z",
    updatedAt: "2026-09-22T08:45:00Z",
  },
  {
    id: "REQ-120",
    title: "Create User Onboarding Walkthrough Tour",
    status: "canceled",
    priority: "medium",
    owner: "Mona Ibrahim",
    ownerInitials: getInitials("Mona Ibrahim"),
    ownerColor: getOwnerColor("Mona Ibrahim"),
    createdAt: "2026-09-21T14:30:00Z",
    updatedAt: "2026-09-22T16:10:00Z",
  },
  {
    id: "REQ-121",
    title: "Implement Rate Limiting on Public Endpoints",
    status: "open",
    priority: "high",
    owner: "Ahmed Hassan",
    ownerInitials: getInitials("Ahmed Hassan"),
    ownerColor: getOwnerColor("Ahmed Hassan"),
    createdAt: "2026-09-22T09:00:00Z",
    updatedAt: "2026-09-22T09:00:00Z",
  },
  {
    id: "REQ-122",
    title: "Add Activity History Log in Detail View",
    status: "in_progress",
    priority: "medium",
    owner: "Sara Ali",
    ownerInitials: getInitials("Sara Ali"),
    ownerColor: getOwnerColor("Sara Ali"),
    createdAt: "2026-09-23T10:30:00Z",
    updatedAt: "2026-09-24T11:20:00Z",
  },
  {
    id: "REQ-123",
    title: "Resolve Cross-Origin Resource Sharing (CORS) Issue",
    status: "completed",
    priority: "urgent",
    owner: "Youssef Tarek",
    ownerInitials: getInitials("Youssef Tarek"),
    ownerColor: getOwnerColor("Youssef Tarek"),
    createdAt: "2026-09-24T08:15:00Z",
    updatedAt: "2026-09-24T14:50:00Z",
  },
  {
    id: "REQ-124",
    title: "Update Privacy Policy and Terms Agreements",
    status: "open",
    priority: "low",
    owner: "Nour El-Din",
    ownerInitials: getInitials("Nour El-Din"),
    ownerColor: getOwnerColor("Nour El-Din"),
    createdAt: "2026-09-25T09:00:00Z",
    updatedAt: "2026-09-25T09:00:00Z",
  },
  {
    id: "REQ-125",
    title: "Fix Form Validation for Arabic Character Names",
    status: "open",
    priority: "high",
    owner: "Mona Ibrahim",
    ownerInitials: getInitials("Mona Ibrahim"),
    ownerColor: getOwnerColor("Mona Ibrahim"),
    createdAt: "2026-09-25T13:40:00Z",
    updatedAt: "2026-09-25T13:40:00Z",
  },
];

export const STATUSES: RequestStatus[] = [
  "open",
  "in_progress",
  "completed",
  "canceled",
];
export const PRIORITIES: RequestPriority[] = [
  "low",
  "medium",
  "high",
  "urgent",
];

// Labels جاهزة للعرض في الـ dropdowns والـ chips بدل القيم الخام
export const STATUS_LABELS: Record<RequestStatus, string> = {
  open: "Open",
  in_progress: "In Progress",
  completed: "Completed",
  canceled: "Canceled",
};
export const PRIORITY_LABELS: Record<RequestPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

// ترتيب الأولوية والحالة عند الفرز (الأهم أولاً)
export const PRIORITY_ORDER: Record<RequestPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
export const STATUS_ORDER: Record<RequestStatus, number> = {
  in_progress: 0,
  open: 1,
  completed: 2,
  canceled: 3,
};

export const SORT_OPTIONS: SortOption[] = [
  { value: "updatedAt", label: "Updated At" },
  { value: "createdAt", label: "Created At" },
  { value: "priority", label: "Priority" },
  { value: "status", label: "Status" },
];

// خيارات الـ dropdowns مبنية على القيم المسموحة فقط
export const STATUS_SELECT_OPTIONS: SelectOption[] = STATUSES.map((s) => ({
  value: s,
  label: STATUS_LABELS[s],
}));
export const PRIORITY_SELECT_OPTIONS: SelectOption[] = PRIORITIES.map((p) => ({
  value: p,
  label: PRIORITY_LABELS[p],
}));
