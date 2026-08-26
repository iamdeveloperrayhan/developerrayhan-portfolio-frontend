import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

const FORM = { headers: { 'Content-Type': undefined } }

/* --------------------------------- Taxonomy ------------------------------- */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await api.get('/categories/')).data,
  })
}

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => (await api.get('/tags/')).data,
  })
}

export function useCategoryMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['categories'] })
  return {
    create: useMutation({
      mutationFn: async (data) => (await api.post('/categories/', data)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, data }) => (await api.patch(`/categories/${id}/`, data)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id) => api.delete(`/categories/${id}/`),
      onSuccess: invalidate,
    }),
  }
}

/* ----------------------------------- Posts -------------------------------- */
export function usePosts(params = {}) {
  return useQuery({
    queryKey: ['posts', params],
    queryFn: async () => (await api.get('/posts/', { params })).data,
    keepPreviousData: true, // smooth pagination / filter changes
  })
}

export function usePost(slug) {
  return useQuery({
    queryKey: ['post', slug],
    queryFn: async () => (await api.get(`/posts/${slug}/`)).data,
    enabled: !!slug,
  })
}

export function usePostMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['posts'] })
  return {
    create: useMutation({
      mutationFn: async (data) => {
        const isForm = data instanceof FormData
        return (await api.post('/posts/', data, isForm ? FORM : undefined)).data
      },
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ slug, data }) => {
        const isForm = data instanceof FormData
        return (await api.patch(`/posts/${slug}/`, data, isForm ? FORM : undefined)).data
      },
      onSuccess: (_d, { slug }) => {
        invalidate()
        qc.invalidateQueries({ queryKey: ['post', slug] })
      },
    }),
    remove: useMutation({
      mutationFn: async (slug) => api.delete(`/posts/${slug}/`),
      onSuccess: invalidate,
    }),
  }
}

/* ------------------------------- Like (toggle) ---------------------------- */
// Optimistic: flip the heart immediately, reconcile with the server, roll back
// on error. Anonymous — keyed by the X-Visitor-Id header (added in api.js).
export function useLikePost(slug) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => (await api.post(`/posts/${slug}/like/`)).data,
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: ['post', slug] })
      const prev = qc.getQueryData(['post', slug])
      qc.setQueryData(['post', slug], (p) =>
        p
          ? {
              ...p,
              is_liked: !p.is_liked,
              likes_count: p.likes_count + (p.is_liked ? -1 : 1),
            }
          : p
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['post', slug], ctx.prev)
    },
    onSuccess: (data) => {
      // Trust the server's authoritative count.
      qc.setQueryData(['post', slug], (p) =>
        p ? { ...p, is_liked: data.liked, likes_count: data.likes_count } : p
      )
    },
  })
}

/* --------------------------------- Comments ------------------------------- */
// Public GET returns a flat array of approved top-level comments (replies nested).
export function useComments(slug) {
  return useQuery({
    queryKey: ['comments', slug],
    queryFn: async () => (await api.get(`/posts/${slug}/comments/`)).data,
    enabled: !!slug,
  })
}

export function useAddComment(slug) {
  return useMutation({
    mutationFn: async (data) => (await api.post(`/posts/${slug}/comments/`, data)).data,
    // No cache update: new comments are held for moderation and not shown until approved.
  })
}
