import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Globe,
  Download,
  Sparkles,
  MapPin,
  CheckCircle2,
} from 'lucide-react'
import { Github, Linkedin, Twitter } from '@/components/ui/BrandIcons'
import { useProfile, useProjects, useSkills } from '@/hooks/usePortfolio'
import { usePosts } from '@/hooks/useBlog'
import { asList } from '@/lib/paginated'
import { usePageMeta } from '@/hooks/usePageMeta'
import ProjectCard from '@/components/ProjectCard'
import PostCard from '@/components/PostCard'
import SkillCard from '@/components/SkillCard'
import SectionHeading from '@/components/ui/SectionHeading'
import { SkeletonGrid } from '@/components/ui/States'
import Button from '@/components/ui/Button'

export default function Home() {
  const { data: profile } = useProfile()
  const { data: projectsData, isLoading: projectsLoading } = useProjects({ is_featured: true })
  const { data: postsData, isLoading: postsLoading } = usePosts({ is_featured: true })
  const { data: skillsData } = useSkills({ is_featured: true })

  usePageMeta(
    'Home',
    profile?.headline || 'Full-stack developer portfolio and blog built with React and Django.'
  )

  const projects = asList(projectsData).slice(0, 3)
  const posts = asList(postsData).slice(0, 3)
  const skills = asList(skillsData).slice(0, 8)

  const socials = [
    { icon: Github, url: profile?.github_url, label: 'GitHub' },
    { icon: Linkedin, url: profile?.linkedin_url, label: 'LinkedIn' },
    { icon: Twitter, url: profile?.x_url, label: 'X' },
    { icon: Globe, url: profile?.website_url, label: 'Website' },
  ].filter((s) => s.url)

  return (
    <div>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute right-10 top-40 h-64 w-64 rounded-full bg-accent-2/20 blur-3xl" />
        </div>

        <div className="container-page grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <div className="animate-fade-up">
            {profile?.is_available_for_hire && (
              <span className="badge mb-5 border-emerald-500/30 bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={13} /> Available for hire
              </span>
            )}
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-body sm:text-5xl lg:text-6xl">
              {profile ? (
                <>
                  Hi, I'm <span className="gradient-text">{profile.full_name}</span>
                </>
              ) : (
                <span className="gradient-text">DevFolio</span>
              )}
            </h1>
            <p className="mt-4 text-lg font-medium text-body/80">
              {profile?.headline || 'Full-Stack Developer'}
            </p>
            <p className="mt-4 max-w-xl text-muted">
              {profile?.bio
                ? profile.bio.split('\n')[0]
                : 'I design and build thoughtful web applications end to end.'}
            </p>

            {profile?.location && (
              <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={15} /> {profile.location}
              </p>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button as={Link} to="/projects" size="lg">
                View my work <ArrowRight size={18} />
              </Button>
              <Button as={Link} to="/contact" variant="secondary" size="lg">
                Get in touch
              </Button>
              {profile?.resume && (
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn-ghost"
                >
                  <Download size={17} /> Résumé
                </a>
              )}
            </div>

            {socials.length > 0 && (
              <div className="mt-8 flex gap-2.5">
                {socials.map(({ icon: Icon, url, label }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={label}
                    className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-accent"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Portrait / gradient panel */}
          <div className="relative animate-fade-up [animation-delay:120ms]">
            <div className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-0 rotate-6 rounded-[2rem] bg-gradient-brand opacity-20 blur-2xl" />
              <div className="card relative h-full w-full overflow-hidden rounded-[2rem]">
                {profile?.avatar ? (
                  <img
                    src={profile.avatar}
                    alt={profile.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center bg-gradient-brand-soft">
                    <Sparkles className="text-accent" size={64} />
                  </div>
                )}
              </div>
              {profile?.years_of_experience > 0 && (
                <div className="card absolute -bottom-5 -left-5 px-5 py-3">
                  <p className="text-2xl font-extrabold gradient-text">
                    {profile.years_of_experience}+
                  </p>
                  <p className="text-xs text-muted">Years experience</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- Skills */}
      {skills.length > 0 && (
        <section className="container-page py-16">
          <SectionHeading
            eyebrow="Toolbox"
            title="Skills I work with"
            subtitle="A snapshot of the technologies I reach for most."
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link to="/about" className="font-semibold text-accent link-underline">
              See full background →
            </Link>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- Projects */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Selected work"
          title="Featured projects"
          subtitle="A few things I've designed, built, and shipped."
        />
        {projectsLoading ? (
          <SkeletonGrid count={3} />
        ) : projects.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">Projects are on the way.</p>
        )}
        <div className="mt-10 text-center">
          <Button as={Link} to="/projects" variant="secondary">
            Browse all projects <ArrowRight size={17} />
          </Button>
        </div>
      </section>

      {/* -------------------------------------------------------------- Blog */}
      <section className="container-page py-16">
        <SectionHeading
          eyebrow="Writing"
          title="Latest from the blog"
          subtitle="Notes on building for the web, one post at a time."
        />
        {postsLoading ? (
          <SkeletonGrid count={3} />
        ) : posts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted">No posts published yet.</p>
        )}
        <div className="mt-10 text-center">
          <Button as={Link} to="/blog" variant="secondary">
            Read the blog <ArrowRight size={17} />
          </Button>
        </div>
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="container-page py-16">
        <div className="card relative overflow-hidden px-8 py-14 text-center sm:px-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-brand-soft opacity-60" />
          <h2 className="text-3xl font-bold tracking-tight text-body sm:text-4xl">
            Let's build something great
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">
            Have a project in mind or just want to say hello? My inbox is always open.
          </p>
          <div className="mt-8">
            <Button as={Link} to="/contact" size="lg">
              Start a conversation <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
