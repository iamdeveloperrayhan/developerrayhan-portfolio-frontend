import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Pencil, Trash2, Star, ExternalLink, FolderKanban } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useProjects, useProjectMutations } from '@/hooks/usePortfolio'
import { asList, pageCount } from '@/lib/paginated'
import { apiError } from '@/lib/api'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Pagination from '@/components/ui/Pagination'
import { ConfirmDialog } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Spinner'
import { EmptyState, ErrorState } from '@/components/ui/States'

const CATEGORIES = [
  { value: 'all', label: 'All' },
  { value: 'WEB', label: 'Web' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'API', label: 'API' },
  { value: 'ML', label: 'ML / AI' },
  { value: 'OTHER', label: 'Other' },
]

const CATEGORY_LABELS = { WEB: 'Web App', MOBILE: 'Mobile', API: 'API', ML: 'ML / AI', OTHER: 'Project' }
const PAGE_SIZE = 9

export default function ProjectsManager() {
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState(null)

  usePageMeta('Manage projects')

  const params = { page }
  if (category !== 'all') params.category = category

  const { data, isLoading, isError, refetch } = useProjects(params)
  const { remove } = useProjectMutations()
  const projects = asList(data)
  const count = pageCount(data)

  const confirmDelete = () => {
    remove.mutate(toDelete.slug, {
      onSuccess: () => {
        toast.success('Project deleted')
        setToDelete(null)
      },
      onError: (err) => toast.error(apiError(err)),
    })
  }

  return (
    <div>
      <PageHeader title="Projects" subtitle="Showcase the things you've built.">
        <Button as={Link} to="/dashboard/projects/new" size="sm">
          <Plus size={16} /> New project
        </Button>
      </PageHeader>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => { setCategory(c.value); setPage(1) }}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              category === c.value
                ? 'border-transparent bg-gradient-brand text-white shadow-glow'
                : 'border-line text-muted hover:text-body'
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          message="Add your first project to your portfolio."
          action={<Button as={Link} to="/dashboard/projects/new" size="sm"><Plus size={16} /> New project</Button>}
        />
      ) : (
        <>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-full shrink-0 overflow-hidden rounded-xl bg-surface-2 sm:w-24">
                  {project.cover_image ? (
                    <img src={project.cover_image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gradient-brand-soft" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="accent">{CATEGORY_LABELS[project.category] || project.category}</Badge>
                    {project.is_featured && <Badge tone="amber"><Star size={12} /> Featured</Badge>}
                  </div>
                  <h3 className="mt-1 truncate font-semibold text-body">{project.title}</h3>
                  <p className="mt-0.5 line-clamp-1 text-sm text-muted">{project.summary}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button as={Link} to={`/projects/${project.slug}`} target="_blank" variant="ghost" size="sm" aria-label="View">
                    <ExternalLink size={16} />
                  </Button>
                  <Button as={Link} to={`/dashboard/projects/${project.slug}/edit`} variant="secondary" size="sm">
                    <Pencil size={15} /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setToDelete(project)} aria-label="Delete" className="text-red-500 hover:bg-red-500/10">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <Pagination count={count} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        loading={remove.isPending}
        title="Delete this project?"
        message={`“${toDelete?.title}” will be permanently removed. This cannot be undone.`}
      />
    </div>
  )
}
