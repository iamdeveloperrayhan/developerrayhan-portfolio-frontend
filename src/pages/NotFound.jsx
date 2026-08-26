import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { usePageMeta } from '@/hooks/usePageMeta'
import Button from '@/components/ui/Button'

export default function NotFound() {
  usePageMeta('Page not found')
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
      </div>
      <p className="font-display text-8xl font-extrabold gradient-text sm:text-9xl">404</p>
      <h1 className="mt-4 text-2xl font-bold text-body sm:text-3xl">Page not found</h1>
      <p className="mt-3 max-w-md text-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button as={Link} to="/">
          <Home size={17} /> Go home
        </Button>
        <Button as={Link} to="/blog" variant="secondary">
          <ArrowLeft size={17} /> Read the blog
        </Button>
      </div>
    </div>
  )
}
