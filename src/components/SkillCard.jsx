import clsx from 'clsx'

const CATEGORY_LABELS = {
  FRONTEND: 'Frontend',
  BACKEND: 'Backend',
  DATABASE: 'Database',
  DEVOPS: 'DevOps',
  TOOLS: 'Tools',
  SOFT_SKILL: 'Soft Skill',
}

// A single skill with an animated proficiency meter.
export default function SkillCard({ skill }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        {skill.icon_image ? (
          <img
            src={skill.icon_image}
            alt=""
            className="h-10 w-10 rounded-xl object-cover"
          />
        ) : (
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-brand-soft text-sm font-bold text-accent">
            {skill.name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-body">{skill.name}</h3>
          <p className="text-xs text-muted">{CATEGORY_LABELS[skill.category] || skill.category}</p>
        </div>
        <span className="text-sm font-bold text-accent">{skill.proficiency}%</span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className={clsx('h-full rounded-full bg-gradient-brand transition-all duration-700')}
          style={{ width: `${Math.min(100, Math.max(0, skill.proficiency))}%` }}
        />
      </div>
    </div>
  )
}
