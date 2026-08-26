import { useState } from 'react'
import { Plus, Pencil, Trash2, Briefcase, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useExperiences, useExperienceMutations } from '@/hooks/usePortfolio'
import { asList } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { dateRange } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import { Field, Input, Textarea, Select, Checkbox } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Modal, { ConfirmDialog } from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import { Loading } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'

const TYPES = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
  { value: 'CONTRACT', label: 'Contract' },
]
const LABELS = Object.fromEntries(TYPES.map((t) => [t.value, t.label]))

const EMPTY = {
  company: '', role: '', employment_type: 'FULL_TIME', location: '',
  start_date: '', end_date: '', is_current: false, description: '',
  company_url: '', display_order: 0,
}

export default function ExperienceManager() {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [toDelete, setToDelete] = useState(null)

  usePageMeta('Manage experience')

  const { data, isLoading, isError, refetch } = useExperiences({ page_size: 100 })
  const { create, update, remove } = useExperienceMutations()
  const items = asList(data)

  // Open the modal for a new ({}) or existing (exp) entry, hydrating the form
  // from the item that triggered it.
  const openEditor = (item) => {
    setForm(item.id ? { ...EMPTY, ...item } : EMPTY)
    setErrors({})
    setEditing(item)
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const err = (k) => (Array.isArray(errors[k]) ? errors[k][0] : errors[k])

  const save = (e) => {
    e.preventDefault()
    setErrors({})
    const data = {
      company: form.company,
      role: form.role,
      employment_type: form.employment_type,
      location: form.location,
      start_date: form.start_date || null,
      end_date: form.is_current ? null : form.end_date || null,
      is_current: form.is_current,
      description: form.description,
      company_url: form.company_url,
      display_order: Number(form.display_order) || 0,
    }
    const opts = {
      onSuccess: () => {
        toast.success(editing.id ? 'Experience updated' : 'Experience added')
        setEditing(null)
      },
      onError: (er) => {
        const d = er?.response?.data
        if (d && typeof d === 'object' && !Array.isArray(d)) setErrors(d)
        toast.error(apiError(er, 'Please fix the errors and try again.'))
      },
    }
    if (editing.id) update.mutate({ id: editing.id, data }, opts)
    else create.mutate(data, opts)
  }

  const confirmDelete = () => {
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success('Experience deleted')
        setToDelete(null)
      },
      onError: (er) => toast.error(apiError(er)),
    })
  }

  return (
    <div>
      <PageHeader title="Experience" subtitle="Your work history and roles.">
        <Button size="sm" onClick={() => openEditor({})}>
          <Plus size={16} /> Add experience
        </Button>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No experience yet"
          message="Add the roles you've held."
          action={<Button size="sm" onClick={() => openEditor({})}><Plus size={16} /> Add experience</Button>}
        />
      ) : (
        <div className="space-y-3">
          {items.map((exp) => (
            <div key={exp.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-start">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand-soft text-accent">
                <Briefcase size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-body">{exp.role}</h3>
                  {exp.is_current && <Badge tone="green">Current</Badge>}
                  <Badge>{LABELS[exp.employment_type] || exp.employment_type}</Badge>
                </div>
                <p className="mt-0.5 inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                  <Building2 size={14} /> {exp.company}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {dateRange(exp.start_date, exp.end_date, exp.is_current)}
                  {exp.location ? ` · ${exp.location}` : ''}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant="secondary" size="sm" onClick={() => openEditor(exp)}>
                  <Pencil size={14} /> Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setToDelete(exp)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit experience' : 'Add experience'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role" htmlFor="role" required error={err('role')}>
              <Input id="role" value={form.role} onChange={set('role')} placeholder="e.g. Senior Developer" required />
            </Field>
            <Field label="Company" htmlFor="company" required error={err('company')}>
              <Input id="company" value={form.company} onChange={set('company')} placeholder="e.g. Acme Inc." required />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Employment type" htmlFor="type" error={err('employment_type')}>
              <Select id="type" value={form.employment_type} onChange={set('employment_type')}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </Select>
            </Field>
            <Field label="Location" htmlFor="location" error={err('location')}>
              <Input id="location" value={form.location} onChange={set('location')} placeholder="e.g. Remote · Dhaka" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start date" htmlFor="start" required error={err('start_date')}>
              <Input id="start" type="date" value={form.start_date} onChange={set('start_date')} required />
            </Field>
            <Field label="End date" htmlFor="end" error={err('end_date')} hint={form.is_current ? 'Cleared for current roles.' : undefined}>
              <Input id="end" type="date" value={form.end_date} onChange={set('end_date')} disabled={form.is_current} />
            </Field>
          </div>
          <Checkbox
            checked={form.is_current}
            onChange={(e) => setForm((f) => ({ ...f, is_current: e.target.checked, end_date: e.target.checked ? '' : f.end_date }))}
            label="I currently work here"
          />
          <Field label="Company URL" htmlFor="curl" error={err('company_url')}>
            <Input id="curl" type="url" value={form.company_url} onChange={set('company_url')} placeholder="https://company.com" />
          </Field>
          <Field label="Description" htmlFor="desc" error={err('description')}>
            <Textarea id="desc" rows={4} value={form.description} onChange={set('description')} placeholder="What you did, impact, key achievements…" />
          </Field>
          <Field label="Display order" htmlFor="order" hint="Lower numbers appear first." error={err('display_order')}>
            <Input id="order" type="number" value={form.display_order} onChange={set('display_order')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" size="sm" loading={create.isPending || update.isPending}>
              {editing?.id ? 'Save changes' : 'Add experience'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete this experience?"
        message={`Your role “${toDelete?.role}” at ${toDelete?.company} will be removed.`}
      />
    </div>
  )
}
