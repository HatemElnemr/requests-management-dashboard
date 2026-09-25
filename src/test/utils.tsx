import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

export function createWrapper(initialEntries = ['/']) {
  // إنشاء QueryClient جديد لكل تست لمنع تداخل الكاش بين الاختيارات
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // إيقاف إعادة المحاولة لتسريع التستات عند الخطأ
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}