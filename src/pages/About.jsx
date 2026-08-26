import { Link } from 'react-router-dom'
import { Download, Briefcase, GraduationCap, MapPin, Building2, ExternalLink } from 'lucide-react'
import { useProfile, useSkills, useExperiences, useEducation } from '@/hooks/usePortfolio'
import { asList } from '@/lib/paginated'
import { dateRange } from '@/lib/format'
import { usePageMeta } from '@/hooks/usePageMeta'
import SectionHeading from '@/components/ui/SectionHeading'
import SkillCard from '@/components/SkillCard'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { Loading } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/States'

const SKILL_GROUPS = [
  { key: 'FRONTEND', label: 'Frontend' },
  { key: 'BACKEND', label: 'Backend' },
  { key: 'DATABASE', label: 'Database' },
  { key: 'DEVOPS', label: 'DevOps' },
  { key: 'TOOLS', label: 'Tools' },
  { key: 'SOFT_SKILL', label: 'Soft Skills' },
]

const EMPLOYMENT_LABELS = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  INTERNSHIP: 'Internship',
  FREELANCE: 'Freelance',
  CONTRACT: 'Contract',
}

export default function About() {
  const { data: profile, isLoading: profileLoading } = useProfile()
  const { data: skillsData } = useSkills({ page_size: 100 })
  const { data: expData } = useExperiences({ page_size: 100 })
  const { data: eduData } = useEducation({ page_size: 100 })

  usePageMeta('About', profile?.headline)

  const skills = asList(skillsData)
  const experiences = asList(expData)
  const education = asList(eduData)

  const grouped = SKILL_GROUPS.map((g) => ({
    ...g,
    items: skills.filter((s) => s.category === g.key),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="container-page py-16">
      {/* ------------------------------------------------------------ Intro */}
      {profileLoading ? (
        <Loading label="Loading profile…" />
      ) : (
        <section className="grid gap-10 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="card p-6 text-center lg:sticky lg:top-24">
            <Avatar
              src={profile?.avatar}
              name={profile?.full_name}
              size={128}
              className="mx-auto text-3xl"
            />
            <h1 className="mt-5 text-2xl font-bold text-body">{profile?.full_name}</h1>
            <p className="mt-1 text-sm font-medium text-accent">{profile?.headline}</p>
            {profile?.location && (
              <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-muted">
                <MapPin size={14} /> {profile.location}
              </p>
            )}
            {profile?.resume && (
              <a
                href={profile.resume}
                target="_blank"
                rel="noreferrer noopener"
                className="btn-primary mt-5 w-full"
              >
                <Download size={16} /> Download résumé
              </a>
            )}
          </div>

          <div>
            <span className="section-eyebrow">About me</span>
            <h2 className="text-3xl font-bold tracking-tight text-body sm:text-4xl">
              A bit of my story
            </h2>
            <div className="mt-6 space-y-4 text-body/80">
              {(profile?.bio || '').split('\n').filter(Boolean).map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ----------------------------------------------------------- Skills */}
      {grouped.length > 0 && (
        <section className="mt-24">
          <SectionHeading eyebrow="Toolbox" title="Skills & expertise" />
          <div className="space-y-10">
            {grouped.map((group) => (
              <div key={group.key}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-muted">
                  {group.label}
                </h3>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((s) => (
                    <SkillCard key={s.id} skill={s} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------------------------------- Experience */}
      <section className="mt-24">
        <SectionHeading eyebrow="Career" title="Work experience" align="left" />
        {experiences.length > 0 ? (
          <div className="relative space-y-8 border-l-2 border-line pl-8">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative">
                <span className="absolute -left-[41px] grid h-8 w-8 place-items-center rounded-full border-2 border-line bg-surface text-accent">
                  <Briefcase size={15} />
                </span>
                <div className="card p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-body">{exp.role}</h3>
                      <p className="inline-flex items-center gap-1.5 text-sm font-medium text-accent">
                        <Building2 size={14} />
                        {exp.company_url ? (
                          <a href={exp.company_url} target="_blank" rel="noreferrer noopener" className="hover:underline">
                            {exp.company}
                          </a>
                        ) : (
                          exp.company
                        )}
                      </p>
                    </div>
                    <span className="badge">{EMPLOYMENT_LABELS[exp.employment_type] || exp.employment_type}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    {dateRange(exp.start_date, exp.end_date, exp.is_current)}
                    {exp.location ? ` · ${exp.location}` : ''}
                  </p>
                  {exp.description && (
                    <p className="mt-3 whitespace-pre-wrap text-sm text-body/80">{exp.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={Briefcase} title="No experience listed yet" />
        )}
      </section>

      {/* -------------------------------------------------------- Education */}
      <section className="mt-24">
        <SectionHeading eyebrow="Background" title="Education" align="left" />
        {education.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {education.map((edu) => (
              <div key={edu.id} className="card p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-brand-soft text-accent">
                  <GraduationCap size={20} />
                </span>
                <h3 className="mt-4 text-lg font-bold text-body">{edu.degree}</h3>
                <p className="text-sm font-medium text-accent">{edu.field_of_study}</p>
                <p className="mt-1 text-sm text-muted">{edu.institution}</p>
                <p className="mt-2 text-xs text-muted">
                  {edu.start_year} – {edu.end_year || 'Present'}
                  {edu.grade ? ` · ${edu.grade}` : ''}
                </p>
                {edu.description && <p className="mt-3 text-sm text-body/80">{edu.description}</p>}
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={GraduationCap} title="No education listed yet" />
        )}
      </section>

      {/* --------------------------------------------------------------- CTA */}
      <section className="mt-24 text-center">
        <p className="text-muted">Want the full picture of what I've built?</p>
        <div className="mt-4 flex justify-center gap-3">
          <Button as={Link} to="/projects" variant="secondary">
            View projects <ExternalLink size={16} />
          </Button>
          <Button as={Link} to="/contact">
            Get in touch
          </Button>
        </div>
      </section>
    </div>
  )
}
