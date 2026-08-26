import clsx from 'clsx'

// Centered (or left) section header with an eyebrow + gradient-capable title.
export default function SectionHeading({ eyebrow, title, subtitle, align = 'center', className }) {
  return (
    <div
      className={clsx(
        'mb-10',
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'text-left',
        className
      )}
    >
      {eyebrow && <span className="section-eyebrow">{eyebrow}</span>}
      <h2 className="text-3xl font-bold tracking-tight text-body sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
    </div>
  )
}
