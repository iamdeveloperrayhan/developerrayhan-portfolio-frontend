import { Link } from 'react-router-dom'
import { ArrowUpRight, Star } from 'lucide-react'
import { Github } from '@/components/ui/BrandIcons'
import Badge from '@/components/ui/Badge'

const CATEGORY_LABELS = {
  WEB: 'Web App',
  MOBILE: 'Mobile',
  API: 'API',
  ML: 'ML / AI',
  OTHER: 'Project',
}

export default function ProjectCard({ project }) {
  const tech = project.tech_stack || []
  return (
    <article className="card card-hover group flex flex-col overflow-hidden">
      <Link to={`/projects/${project.slug}`} className="relative block overflow-hidden">
        <div className="aspect-[16/10] w-full overflow-hidden bg-surface-2">
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-gradient-brand-soft" />
          )}
        </div>
        <div className="absolute left-3 top-3 flex gap-2">
          <Badge tone="accent">{CATEGORY_LABELS[project.category] || project.category}</Badge>
          {project.is_featured && (
            <Badge tone="amber"><Star size={12} /> Featured</Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold tracking-tight text-body">
          <Link to={`/projects/${project.slug}`} className="hover:text-accent">
            {project.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted">{project.summary}</p>

        {tech.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {tech.slice(0, 4).map((t) => (
              <span key={t.id} className="badge">{t.name}</span>
            ))}
            {tech.length > 4 && <span className="badge">+{tech.length - 4}</span>}
          </div>
        )}

        <div className="mt-5 flex items-center gap-4 border-t border-line pt-4 text-sm">
          <Link to={`/projects/${project.slug}`} className="font-semibold text-accent link-underline">
            View details
          </Link>
          <div className="ml-auto flex gap-2">
            {project.github_url && (
              <a href={project.github_url} target="_blank" rel="noreferrer noopener" aria-label="GitHub repository" className="text-muted hover:text-accent">
                <Github size={18} />
              </a>
            )}
            {project.live_url && (
              <a href={project.live_url} target="_blank" rel="noreferrer noopener" aria-label="Live site" className="text-muted hover:text-accent">
                <ArrowUpRight size={18} />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
