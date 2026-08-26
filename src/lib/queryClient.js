import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 min — feels fresh without hammering the API
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
