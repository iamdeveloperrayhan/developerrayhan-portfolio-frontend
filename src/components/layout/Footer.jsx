import { Link } from 'react-router-dom'
import { Globe, Mail, Sparkles } from 'lucide-react'
import { Github, Linkedin, Twitter } from '@/components/ui/BrandIcons'
import { useProfile } from '@/hooks/usePortfolio'
import { useAuth } from '@/context/AuthContext'

export default function Footer() {
  const { data: profile } = useProfile()
  const { isAuthenticated } = useAuth()
  const year = new Date().getFullYear()

  const socials = [
    { icon: Github, url: profile?.github_url, label: 'GitHub' },
    { icon: Linkedin, url: profile?.linkedin_url, label: 'LinkedIn' },
    { icon: Twitter, url: profile?.x_url, label: 'X' },
    { icon: Globe, url: profile?.website_url, label: 'Website' },
    { icon: Mail, url: profile?.email ? `mailto:${profile.email}` : null, label: 'Email' },
  ].filter((s) => s.url)

  return (
    <footer className="mt-24 border-t border-line/70 bg-surface/40">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-brand text-white">
              <Sparkles size={18} />
            </span>
            <span className="gradient-text">DevFolio</span>
          </Link>
          <p className="mt-4 max-w-sm text-sm text-muted">
            {profile?.headline || 'Full-stack developer building thoughtful web apps with React and Django.'}
          </p>
          <div className="mt-5 flex gap-2.5">
            {socials.map(({ icon: Icon, url, label }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-accent"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-body">Explore</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            <li><Link to="/about" className="hover:text-accent">About</Link></li>
            <li><Link to="/projects" className="hover:text-accent">Projects</Link></li>
            <li><Link to="/blog" className="hover:text-accent">Blog</Link></li>
            <li><Link to="/contact" className="hover:text-accent">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold text-body">Get in touch</h4>
          <ul className="space-y-2.5 text-sm text-muted">
            {profile?.email && (
              <li><a href={`mailto:${profile.email}`} className="hover:text-accent">{profile.email}</a></li>
            )}
            {profile?.location && <li>{profile.location}</li>}
            <li>
              <Link to={isAuthenticated ? '/dashboard' : '/login'} className="hover:text-accent">
                {isAuthenticated ? 'Dashboard' : 'Owner sign in'}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line/70">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-6 text-xs text-muted sm:flex-row">
          <p>© {year} {profile?.full_name || 'DevFolio'}. All rights reserved.</p>
          <p>Built with React, Django REST & Tailwind CSS.</p>
        </div>
      </div>
    </footer>
  )
}
