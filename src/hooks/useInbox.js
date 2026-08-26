import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

/* --------------------------------- Contact -------------------------------- */
// Public: send a message from the contact form.
export function useSendMessage() {
  return useMutation({
    mutationFn: async (data) => (await api.post('/contact/', data)).data,
  })
}

// Owner: inbox.
export function useMessages(params = {}) {
  return useQuery({
    queryKey: ['messages', params],
    queryFn: async () => (await api.get('/contact/', { params })).data,
  })
}

export function useMessageMutations() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['messages'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
  }
  return {
    markRead: useMutation({
      mutationFn: async ({ id, is_read }) =>
        (await api.patch(`/contact/${id}/`, { is_read })).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id) => api.delete(`/contact/${id}/`),
      onSuccess: invalidate,
    }),
  }
}

/* ---------------------------- Comment moderation -------------------------- */
export function useModerationComments(params = {}) {
  return useQuery({
    queryKey: ['moderation-comments', params],
    queryFn: async () => (await api.get('/comments/', { params })).data,
  })
}

export function useCommentModeration() {
  const qc = useQueryClient()
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['moderation-comments'] })
    qc.invalidateQueries({ queryKey: ['stats'] })
    qc.invalidateQueries({ queryKey: ['comments'] }) // public threads may change
  }
  return {
    setApproved: useMutation({
      mutationFn: async ({ id, is_approved }) =>
        (await api.patch(`/comments/${id}/`, { is_approved })).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id) => api.delete(`/comments/${id}/`),
      onSuccess: invalidate,
    }),
  }
}

/* -------------------------------- Dashboard ------------------------------- */
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => (await api.get('/dashboard/stats/')).data,
  })
}
