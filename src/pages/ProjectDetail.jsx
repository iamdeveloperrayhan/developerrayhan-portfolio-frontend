import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Calendar, Star } from 'lucide-react'
import { Github } from '@/components/ui/BrandIcons'
import { useProject } from '@/hooks/usePortfolio'
import { formatDate } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import Markdown from '@/components/Markdown'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Loading } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/States'

const CATEGORY_LABELS = {
  WEB: 'Web App',
  MOBILE: 'Mobile',
  API: 'API',
  ML: 'ML / AI',
  OTHER: 'Project',
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { data: project, isLoading, isError, refetch } = useProject(slug)

  usePageMeta(project?.title, project?.summary)

  if (isLoading) return <div className="container-page py-16"><Loading label="Loading project…" /></div>
  if (isError || !project)
    return (
      <div className="container-page py-16">
        <ErrorState message="This project couldn't be found." onRetry={refetch} />
        <div className="mt-6 text-center">
          <Button as={Link} to="/projects" variant="secondary">Back to projects</Button>
        </div>
      </div>
    )

  const tech = project.tech_stack || []

  return (
    <article className="container-page py-16">
      <button
        onClick={() => navigate(-1)}
        className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-accent"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="accent">{CATEGORY_LABELS[project.category] || project.category}</Badge>
        {project.is_featured && (
          <Badge tone="amber"><Star size={12} /> Featured</Badge>
        )}
        {project.completed_date && (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted">
            <Calendar size={14} /> {formatDate(project.completed_date)}
          </span>
        )}
      </div>

      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-body sm:text-5xl">
        {project.title}
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">{project.summary}</p>

      <div className="mt-6 flex flex-wrap gap-3">
        {project.live_url && (
          <Button as="a" href={project.live_url} target="_blank" rel="noreferrer noopener">
            <ExternalLink size={17} /> Visit live site
          </Button>
        )}
        {project.github_url && (
          <Button as="a" href={project.github_url} target="_blank" rel="noreferrer noopener" variant="secondary">
            <Github size={17} /> Source code
          </Button>
        )}
      </div>

      {project.cover_image && (
        <div className="mt-10 overflow-hidden rounded-3xl border border-line">
          <img src={project.cover_image} alt={project.title} className="w-full object-cover" />
        </div>
      )}

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_260px]">
        <div>
          <Markdown>{project.description}</Markdown>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {tech.length > 0 && (
            <div className="card p-6">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                Tech stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {tech.map((t) => (
                  <span key={t.id} className="badge-accent">{t.name}</span>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  )
}
