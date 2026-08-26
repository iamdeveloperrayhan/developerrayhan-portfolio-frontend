import { useState } from 'react'
import { Search, X } from 'lucide-react'
import { usePosts, useCategories } from '@/hooks/useBlog'
import { asList, pageCount } from '@/lib/paginated'
import { usePageMeta } from '@/hooks/usePageMeta'
import PostCard from '@/components/PostCard'
import SectionHeading from '@/components/ui/SectionHeading'
import Pagination from '@/components/ui/Pagination'
import { SkeletonGrid, EmptyState, ErrorState } from '@/components/ui/States'
import clsx from 'clsx'

const PAGE_SIZE = 6

export default function Blog() {
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  usePageMeta('Blog', 'Articles and notes on full-stack web development.')

  const { data: categoriesData } = useCategories()
  const categories = asList(categoriesData)

  const params = { page }
  if (category) params.category = category
  if (query) params.search = query

  const { data, isLoading, isError, refetch, isFetching } = usePosts(params)
  const posts = asList(data)
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
  const pickCategory = (slug) => {
    setCategory(slug)
    setPage(1)
  }

  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="Blog"
        title="Writing & notes"
        subtitle="Thoughts on building for the web — architecture, tooling, and lessons learned."
      />

      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => pickCategory('')}
            className={clsx(
              'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
              category === ''
                ? 'border-transparent bg-gradient-brand text-white shadow-glow'
                : 'border-line text-muted hover:border-accent/40 hover:text-body'
            )}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => pickCategory(c.slug)}
              className={clsx(
                'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors',
                category === c.slug
                  ? 'border-transparent bg-gradient-brand text-white shadow-glow'
                  : 'border-line text-muted hover:border-accent/40 hover:text-body'
              )}
            >
              {c.name}
              {typeof c.posts_count === 'number' && (
                <span className="ml-1.5 text-xs opacity-70">{c.posts_count}</span>
              )}
            </button>
          ))}
        </div>

        <form onSubmit={submitSearch} className="relative w-full lg:w-72">
          <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search articles…"
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

      {isLoading ? (
        <SkeletonGrid count={6} />
      ) : isError ? (
        <ErrorState onRetry={refetch} />
      ) : posts.length === 0 ? (
        <EmptyState
          title="No posts found"
          message={query ? `No results for "${query}".` : 'No articles published yet — check back soon.'}
        />
      ) : (
        <>
          <div className={clsx('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', isFetching && 'opacity-60')}>
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
          <Pagination count={count} page={page} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </div>
  )
}
