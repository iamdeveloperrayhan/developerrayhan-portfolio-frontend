import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { useProjects } from '@/hooks/usePortfolio'
import { asList, pageCount } from '@/lib/paginated'
import { usePageMeta } from '@/hooks/usePageMeta'
import ProjectCard from '@/components/ProjectCard'
import SectionHeading from '@/components/ui/SectionHeading'
import Pagination from '@/components/ui/Pagination'
import { SkeletonGrid, EmptyState, ErrorState } from '@/components/ui/States'
import clsx from 'clsx'

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'WEB', label: 'Web Apps' },
  { value: 'MOBILE', label: 'Mobile' },
  { value: 'API', label: 'APIs' },
  { value: 'ML', label: 'ML / AI' },
  { value: 'OTHER', label: 'Other' },
]

const PAGE_SIZE = 9

export default function Projects() {
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  usePageMeta('Projects', 'Selected projects — web apps, APIs, and experiments.')

  const params = { page }
  if (category) params.category = category
  if (query) params.search = query

  const { data, isLoading, isError, refetch, isFetching } = useProjects(params)
  const projects = asList(data)
  const count = pageCount(data)

  const submitSearch = (e) => {
    e.preventDefault()
    setQuery(search.trim())
    setPage(1)
  }

  const clearSearch = () => {
    setSearch('')
    setQuery('')
    setPage(1)
  }

  const pickCategory = (value) => {
    setCategory(value)
    setPage(1)
  }

  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="Portfolio"
        title="Things I've built"
        subtitle="A collection of projects spanning full-stack apps, APIs, and side experiments."
      />

      {/* Controls */}
      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => pickCategory(c.value)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                category === c.value
                  ? 'border-transparent bg-gradient-brand text-white shadow-glow'
                  : 'border-line text-muted hover:border-accent/40 hover:text-body'
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="relative w-full lg:w-72">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects…"
            className="input pl-10 pr-10"
          />
          {(search || query) && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-body"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      {/* Results */}
      {isLoading ? (
        <SkeletonGrid count={9} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : projects.length === 0 ? (
        <EmptyState
          title="No projects found"
          message={query ? `No results for "${query}". Try a different search.` : 'Check back soon.'}
        />
      ) : (
        <>
          <div className={clsx('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', isFetching && 'opacity-60')}>
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          <Pagination count={count} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </div>
  )
}
