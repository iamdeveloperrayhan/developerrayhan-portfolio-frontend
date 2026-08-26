import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Save, Image as ImageIcon, X, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useProject, useProjectMutations, useSkills } from '@/hooks/usePortfolio'
import { asList } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import { Field, Input, Textarea, Select, Checkbox } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import { Loading } from '@/components/ui/Spinner'

const EMPTY = {
  title: '',
  summary: '',
  description: '',
  category: 'WEB',
  live_url: '',
  github_url: '',
  completed_date: '',
  display_order: 0,
  is_featured: false,
  tech_stack_ids: [],
}

const CATEGORIES = [
  { value: 'WEB', label: 'Web App' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'API', label: 'API' },
  { value: 'ML', label: 'ML / AI' },
  { value: 'OTHER', label: 'Other' },
]

export default function ProjectEditor() {
  const { slug } = useParams()
  const isEdit = !!slug
  const navigate = useNavigate()

  const { data: project, isLoading: loadingProject } = useProject(isEdit ? slug : null)
  const { data: skillsData } = useSkills({ page_size: 100 })
  const { create, update } = useProjectMutations()
  const skills = asList(skillsData)

  const [form, setForm] = useState(EMPTY)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)
  const [removeCover, setRemoveCover] = useState(false)
  const [errors, setErrors] = useState({})
  const [hydratedId, setHydratedId] = useState(null)

  usePageMeta(isEdit ? 'Edit project' : 'New project')

  // Hydrate the form once the project has loaded (render-phase, so the fields
  // are populated before first paint). Runs again only if the target changes.
  if (isEdit && project && hydratedId !== project.id) {
    setHydratedId(project.id)
    setForm({
      title: project.title || '',
      summary: project.summary || '',
      description: project.description || '',
      category: project.category || 'WEB',
      live_url: project.live_url || '',
      github_url: project.github_url || '',
      completed_date: project.completed_date || '',
      display_order: project.display_order ?? 0,
      is_featured: !!project.is_featured,
      tech_stack_ids: (project.tech_stack || []).map((t) => t.id),
    })
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleTech = (id) =>
    setForm((f) => ({
      ...f,
      tech_stack_ids: f.tech_stack_ids.includes(id)
        ? f.tech_stack_ids.filter((t) => t !== id)
        : [...f.tech_stack_ids, id],
    }))

  const onCover = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
    setRemoveCover(false)
  }

  const buildPayload = () => {
    if (coverFile) {
      const fd = new FormData()
      fd.append('title', form.title)
      fd.append('summary', form.summary)
      fd.append('description', form.description)
      fd.append('category', form.category)
      fd.append('live_url', form.live_url)
      fd.append('github_url', form.github_url)
      if (form.completed_date) fd.append('completed_date', form.completed_date)
      fd.append('display_order', form.display_order || 0)
      fd.append('is_featured', form.is_featured)
      form.tech_stack_ids.forEach((id) => fd.append('tech_stack_ids', id))
      fd.append('cover_image', coverFile)
      return fd
    }
    const payload = {
      title: form.title,
      summary: form.summary,
      description: form.description,
      category: form.category,
      live_url: form.live_url,
      github_url: form.github_url,
      completed_date: form.completed_date || null,
      display_order: Number(form.display_order) || 0,
      is_featured: form.is_featured,
      tech_stack_ids: form.tech_stack_ids,
    }
    if (removeCover) payload.cover_image = null
    return payload
  }

  const submit = (e) => {
    e.preventDefault()
    setErrors({})
    const payload = buildPayload()
    const opts = {
      onSuccess: () => {
        toast.success(isEdit ? 'Project updated' : 'Project created')
        navigate('/dashboard/projects')
      },
      onError: (err) => {
        const data = err?.response?.data
        if (data && typeof data === 'object' && !Array.isArray(data)) setErrors(data)
        toast.error(apiError(err, 'Please fix the errors and try again.'))
      },
    }
    if (isEdit) update.mutate({ slug, data: payload }, opts)
    else create.mutate(payload, opts)
  }

  const err = (k) => (Array.isArray(errors[k]) ? errors[k][0] : errors[k])
  const saving = create.isPending || update.isPending
  const existingCover = isEdit && project?.cover_image && !removeCover ? project.cover_image : null
  // Serializer raises a non-field error when neither URL is provided.
  const nonFieldError = err('non_field_errors') || (typeof errors === 'object' && Array.isArray(errors) ? errors[0] : null)

  if (isEdit && loadingProject) return <Loading label="Loading project…" />

  return (
    <form onSubmit={submit}>
      <Link to="/dashboard/projects" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent">
        <ArrowLeft size={16} /> Back to projects
      </Link>

      <PageHeader title={isEdit ? 'Edit project' : 'New project'}>
        <Button type="button" variant="secondary" size="sm" onClick={() => navigate('/dashboard/projects')}>
          Cancel
        </Button>
        <Button type="submit" size="sm" loading={saving}>
          <Save size={16} /> Save project
        </Button>
      </PageHeader>

      {nonFieldError && (
        <p className="mb-4 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {nonFieldError}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main column */}
        <div className="space-y-5">
          <div className="card p-6">
            <Field label="Title" htmlFor="title" required error={err('title')}>
              <Input id="title" value={form.title} onChange={set('title')} placeholder="Project name" required />
            </Field>
            <Field label="Summary" htmlFor="summary" required error={err('summary')} hint="One or two lines shown on cards." className="mt-5">
              <Textarea id="summary" rows={2} value={form.summary} onChange={set('summary')} placeholder="A short tagline for this project." required />
            </Field>
          </div>

          <div className="card p-6">
            <Field label="Description (Markdown)" htmlFor="description" error={err('description')} hint="The full write-up shown on the project page.">
              <Textarea id="description" rows={14} value={form.description} onChange={set('description')} className="font-mono text-sm" placeholder="Describe the project, your role, the stack, the outcome…" />
            </Field>
          </div>

          <div className="card p-6">
            <Field label="Live URL" htmlFor="live_url" error={err('live_url')}>
              <Input id="live_url" type="url" value={form.live_url} onChange={set('live_url')} placeholder="https://example.com" />
            </Field>
            <Field label="GitHub URL" htmlFor="github_url" error={err('github_url')} className="mt-5">
              <Input id="github_url" type="url" value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/you/repo" />
            </Field>
            <p className="mt-2 text-xs text-muted">Provide at least one of the two.</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          <div className="card p-6">
            <h3 className="mb-4 font-bold text-body">Details</h3>
            <Field label="Category" htmlFor="category" error={err('category')}>
              <Select id="category" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Select>
            </Field>
            <Field label="Completed date" htmlFor="completed_date" error={err('completed_date')} className="mt-4">
              <Input id="completed_date" type="date" value={form.completed_date} onChange={set('completed_date')} />
            </Field>
            <Field label="Display order" htmlFor="display_order" hint="Lower numbers appear first." error={err('display_order')} className="mt-4">
              <Input id="display_order" type="number" value={form.display_order} onChange={set('display_order')} />
            </Field>
            <div className="mt-4">
              <Checkbox
                checked={form.is_featured}
                onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                label={<span className="inline-flex items-center gap-1"><Star size={14} /> Featured project</span>}
              />
            </div>
          </div>

          <div className="card p-6">
            <span className="label">Tech stack</span>
            <p className="mb-3 text-xs text-muted">Pick from your skills.</p>
            <div className="flex flex-wrap gap-2">
              {skills.length === 0 && <p className="text-xs text-muted">Add skills first to tag them here.</p>}
              {skills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleTech(s.id)}
                  className={clsx(
                    'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                    form.tech_stack_ids.includes(s.id)
                      ? 'border-transparent bg-gradient-brand text-white'
                      : 'border-line text-muted hover:text-body'
                  )}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <span className="label">Cover image</span>
            {existingCover || coverPreview ? (
              <div className="relative overflow-hidden rounded-xl border border-line">
                <img src={coverPreview || existingCover} alt="" className="aspect-[16/10] w-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setCoverFile(null)
                    setCoverPreview(null)
                    if (existingCover) setRemoveCover(true)
                  }}
                  className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-slate-950/60 text-white hover:bg-red-500"
                  aria-label="Remove cover"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-line py-8 text-center text-muted hover:border-accent/40 hover:text-accent">
                <ImageIcon size={24} />
                <span className="text-sm font-medium">Upload a cover</span>
                <input type="file" accept="image/*" onChange={onCover} className="hidden" />
              </label>
            )}
            {err('cover_image') && <p className="mt-2 text-xs font-medium text-red-500">{err('cover_image')}</p>}
          </div>
        </div>
      </div>
    </form>
  )
}
