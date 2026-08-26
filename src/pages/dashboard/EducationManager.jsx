import { useState } from 'react'
import { Plus, Pencil, Trash2, GraduationCap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useEducation, useEducationMutations } from '@/hooks/usePortfolio'
import { asList } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import { Field, Input, Textarea } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Modal, { ConfirmDialog } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'

const EMPTY = {
  institution: '', degree: '', field_of_study: '',
  start_year: '', end_year: '', grade: '', description: '', display_order: 0,
}

export default function EducationManager() {
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [toDelete, setToDelete] = useState(null)

  usePageMeta('Manage education')

  const { data, isLoading, isError, refetch } = useEducation({ page_size: 100 })
  const { create, update, remove } = useEducationMutations()
  const items = asList(data)

  // Open the modal for a new ({}) or existing (edu) entry, hydrating the form
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
      institution: form.institution,
      degree: form.degree,
      field_of_study: form.field_of_study,
      start_year: form.start_year ? Number(form.start_year) : null,
      end_year: form.end_year ? Number(form.end_year) : null,
      grade: form.grade,
      description: form.description,
      display_order: Number(form.display_order) || 0,
    }
    const opts = {
      onSuccess: () => {
        toast.success(editing.id ? 'Education updated' : 'Education added')
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
        toast.success('Education deleted')
        setToDelete(null)
      },
      onError: (er) => toast.error(apiError(er)),
    })
  }

  return (
    <div>
      <PageHeader title="Education" subtitle="Your degrees and qualifications.">
        <Button size="sm" onClick={() => openEditor({})}>
          <Plus size={16} /> Add education
        </Button>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education yet"
          message="Add your academic background."
          action={<Button size="sm" onClick={() => openEditor({})}><Plus size={16} /> Add education</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((edu) => (
            <div key={edu.id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-brand-soft text-accent">
                  <GraduationCap size={19} />
                </span>
                <div className="flex gap-1.5">
                  <Button variant="ghost" size="sm" onClick={() => openEditor(edu)} aria-label="Edit">
                    <Pencil size={15} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setToDelete(edu)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
              <h3 className="mt-4 font-bold text-body">{edu.degree}</h3>
              <p className="text-sm font-medium text-accent">{edu.field_of_study}</p>
              <p className="mt-1 text-sm text-muted">{edu.institution}</p>
              <p className="mt-2 text-xs text-muted">
                {edu.start_year} – {edu.end_year || 'Present'}
                {edu.grade ? ` · ${edu.grade}` : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit education' : 'Add education'} size="lg">
        <form onSubmit={save} className="space-y-4">
          <Field label="Institution" htmlFor="institution" required error={err('institution')}>
            <Input id="institution" value={form.institution} onChange={set('institution')} placeholder="e.g. University of Dhaka" required />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Degree" htmlFor="degree" required error={err('degree')}>
              <Input id="degree" value={form.degree} onChange={set('degree')} placeholder="e.g. BSc" required />
            </Field>
            <Field label="Field of study" htmlFor="field" error={err('field_of_study')}>
              <Input id="field" value={form.field_of_study} onChange={set('field_of_study')} placeholder="e.g. Computer Science" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Start year" htmlFor="start" required error={err('start_year')}>
              <Input id="start" type="number" value={form.start_year} onChange={set('start_year')} placeholder="2018" required />
            </Field>
            <Field label="End year" htmlFor="end" hint="Blank if ongoing." error={err('end_year')}>
              <Input id="end" type="number" value={form.end_year} onChange={set('end_year')} placeholder="2022" />
            </Field>
            <Field label="Grade" htmlFor="grade" error={err('grade')}>
              <Input id="grade" value={form.grade} onChange={set('grade')} placeholder="e.g. 3.8 GPA" />
            </Field>
          </div>
          <Field label="Description" htmlFor="desc" error={err('description')}>
            <Textarea id="desc" rows={3} value={form.description} onChange={set('description')} placeholder="Focus areas, honors, activities…" />
          </Field>
          <Field label="Display order" htmlFor="order" hint="Lower numbers appear first." error={err('display_order')}>
            <Input id="order" type="number" value={form.display_order} onChange={set('display_order')} />
          </Field>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" size="sm" loading={create.isPending || update.isPending}>
              {editing?.id ? 'Save changes' : 'Add education'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete this education?"
        message={`“${toDelete?.degree}” at ${toDelete?.institution} will be removed.`}
      />
    </div>
  )
}
