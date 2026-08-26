import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/api'

// FormData requests: let the browser set the multipart boundary.
const FORM = { headers: { 'Content-Type': undefined } }

/* ----------------------------------- Profile ----------------------------- */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await api.get('/profile/')).data,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload) => {
      const isForm = payload instanceof FormData
      return (await api.patch('/profile/', payload, isForm ? FORM : undefined)).data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['profile'] }),
  })
}

/* ------------------------------------ Skills ------------------------------ */
export function useSkills(params = {}) {
  return useQuery({
    queryKey: ['skills', params],
    queryFn: async () => (await api.get('/skills/', { params })).data,
  })
}

export function useSkillMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['skills'] })
  return {
    create: useMutation({
      mutationFn: async (data) => (await api.post('/skills/', data)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, data }) => (await api.patch(`/skills/${id}/`, data)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id) => api.delete(`/skills/${id}/`),
      onSuccess: invalidate,
    }),
  }
}

/* --------------------------------- Experience ----------------------------- */
export function useExperiences(params = {}) {
  return useQuery({
    queryKey: ['experiences', params],
    queryFn: async () => (await api.get('/experiences/', { params })).data,
  })
}

export function useExperienceMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['experiences'] })
  return {
    create: useMutation({
      mutationFn: async (data) => (await api.post('/experiences/', data)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, data }) => (await api.patch(`/experiences/${id}/`, data)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id) => api.delete(`/experiences/${id}/`),
      onSuccess: invalidate,
    }),
  }
}

/* --------------------------------- Education ------------------------------ */
export function useEducation(params = {}) {
  return useQuery({
    queryKey: ['education', params],
    queryFn: async () => (await api.get('/education/', { params })).data,
  })
}

export function useEducationMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['education'] })
  return {
    create: useMutation({
      mutationFn: async (data) => (await api.post('/education/', data)).data,
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ id, data }) => (await api.patch(`/education/${id}/`, data)).data,
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: async (id) => api.delete(`/education/${id}/`),
      onSuccess: invalidate,
    }),
  }
}

/* ---------------------------------- Projects ------------------------------ */
export function useProjects(params = {}) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: async () => (await api.get('/projects/', { params })).data,
  })
}

export function useProject(slug) {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: async () => (await api.get(`/projects/${slug}/`)).data,
    enabled: !!slug,
  })
}

export function useProjectMutations() {
  const qc = useQueryClient()
  const invalidate = () => qc.invalidateQueries({ queryKey: ['projects'] })
  return {
    create: useMutation({
      mutationFn: async (data) => {
        const isForm = data instanceof FormData
        return (await api.post('/projects/', data, isForm ? FORM : undefined)).data
      },
      onSuccess: invalidate,
    }),
    update: useMutation({
      mutationFn: async ({ slug, data }) => {
        const isForm = data instanceof FormData
        return (await api.patch(`/projects/${slug}/`, data, isForm ? FORM : undefined)).data
      },
      onSuccess: (_d, { slug }) => {
        invalidate()
        qc.invalidateQueries({ queryKey: ['project', slug] })
      },
    }),
    remove: useMutation({
      mutationFn: async (slug) => api.delete(`/projects/${slug}/`),
      onSuccess: invalidate,
    }),
  }
}
