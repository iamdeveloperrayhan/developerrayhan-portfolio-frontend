import { useState } from 'react'
import { Plus, Pencil, Trash2, Star, Wrench, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSkills, useSkillMutations } from '@/hooks/usePortfolio'
import { asList } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import { Field, Input, Select, Checkbox } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Modal, { ConfirmDialog } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'

const CATEGORIES = [
  { value: 'FRONTEND', label: 'Frontend' },
  { value: 'BACKEND', label: 'Backend' },
  { value: 'DATABASE', label: 'Database' },
  { value: 'DEVOPS', label: 'DevOps' },
  { value: 'TOOLS', label: 'Tools' },
  { value: 'SOFT_SKILL', label: 'Soft Skills' },
]
const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.label]))

const EMPTY = { name: '', category: 'FRONTEND', proficiency: 75, icon: '', display_order: 0, is_featured: false }

export default function SkillsManager() {
  const [editing, setEditing] = useState(null) // null | {} (new) | skill (edit)
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [toDelete, setToDelete] = useState(null)

  usePageMeta('Manage skills')

  const { data, isLoading, isError, refetch } = useSkills({ page_size: 100 })
  const { create, update, remove } = useSkillMutations()
  const skills = asList(data)

  // Open the modal for a new ({}) or existing (skill) entry, hydrating the form
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
      name: form.name,
      category: form.category,
      proficiency: Number(form.proficiency),
      icon: form.icon,
      display_order: Number(form.display_order) || 0,
      is_featured: form.is_featured,
    }
    const opts = {
      onSuccess: () => {
        toast.success(editing.id ? 'Skill updated' : 'Skill added')
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
        toast.success('Skill deleted')
        setToDelete(null)
      },
      onError: (er) => toast.error(apiError(er)),
    })
  }

  // Group by category for a tidy list.
  const grouped = CATEGORIES.map((c) => ({
    ...c,
    items: skills.filter((s) => s.category === c.value),
  })).filter((g) => g.items.length > 0)

  return (
    <div>
      <PageHeader title="Skills" subtitle="The tools and technologies you work with.">
        <Button size="sm" onClick={() => openEditor({})}>
          <Plus size={16} /> Add skill
        </Button>
      </PageHeader>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : skills.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No skills yet"
          message="Add the technologies you want to showcase."
          action={<Button size="sm" onClick={() => openEditor({})}><Plus size={16} /> Add skill</Button>}
        />
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.value}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted">{group.label}</h3>
              <div className="space-y-2">
                {group.items.map((s) => (
                  <div key={s.id} className="card flex items-center gap-3 p-3">
                    <GripVertical size={16} className="shrink-0 text-muted/50" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-semibold text-body">{s.name}</span>
                        {s.is_featured && <Star size={13} className="shrink-0 text-amber-500" />}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-surface-2">
                          <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${s.proficiency}%` }} />
                        </div>
                        <span className="text-xs text-muted">{s.proficiency}%</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => openEditor(s)}>
                      <Pencil size={14} /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setToDelete(s)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit skill' : 'Add skill'}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Name" htmlFor="name" required error={err('name')}>
            <Input id="name" value={form.name} onChange={set('name')} placeholder="e.g. React" required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" htmlFor="category" error={err('category')}>
              <Select id="category" value={form.category} onChange={set('category')}>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="Display order" htmlFor="order" error={err('display_order')}>
              <Input id="order" type="number" value={form.display_order} onChange={set('display_order')} />
            </Field>
          </div>
          <Field label={`Proficiency — ${form.proficiency}%`} htmlFor="prof" error={err('proficiency')}>
            <input
              id="prof"
              type="range"
              min={1}
              max={100}
              value={form.proficiency}
              onChange={set('proficiency')}
              className="w-full accent-[rgb(var(--accent))]"
            />
          </Field>
          <Field label="Icon name" htmlFor="icon" hint="Optional text label (e.g. a devicon class or emoji)." error={err('icon')}>
            <Input id="icon" value={form.icon} onChange={set('icon')} placeholder="Optional" />
          </Field>
          <Checkbox
            checked={form.is_featured}
            onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
            label={<span className="inline-flex items-center gap-1"><Star size={14} /> Show on homepage</span>}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" size="sm" loading={create.isPending || update.isPending}>
              {editing?.id ? 'Save changes' : 'Add skill'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete this skill?"
        message={`“${toDelete?.name}” will be removed${LABELS[toDelete?.category] ? ` from ${LABELS[toDelete.category]}` : ''}.`}
      />
    </div>
  )
}
