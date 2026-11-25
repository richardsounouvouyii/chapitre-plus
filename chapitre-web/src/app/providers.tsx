import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { ToastProvider, ToastViewport } from '@/components/ui'
import { AuthSessionProvider } from '@/features/auth/AuthSessionProvider'

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AuthSessionProvider>
        <ToastProvider>
          {children}
          <ToastViewport />
        </ToastProvider>
      </AuthSessionProvider>
    </QueryClientProvider>
  )
}
