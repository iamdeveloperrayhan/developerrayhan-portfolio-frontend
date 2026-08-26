import { useState } from 'react'
import { Mail, MapPin, Phone, Send, Globe, CheckCircle2 } from 'lucide-react'
import { Github, Linkedin, Twitter } from '@/components/ui/BrandIcons'
import toast from 'react-hot-toast'
import { useProfile } from '@/hooks/usePortfolio'
import { useSendMessage } from '@/hooks/useInbox'
import { apiError } from '@/lib/api'
import { usePageMeta } from '@/hooks/usePageMeta'
import SectionHeading from '@/components/ui/SectionHeading'
import { Field, Input, Textarea } from '@/components/ui/Form'
import Button from '@/components/ui/Button'

const EMPTY = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const { data: profile } = useProfile()
  const sendMessage = useSendMessage()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

  usePageMeta('Contact', 'Get in touch — let\'s talk about your project.')

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = (e) => {
    e.preventDefault()
    setErrors({})
    sendMessage.mutate(form, {
      onSuccess: (res) => {
        toast.success(res?.detail || 'Message sent!')
        setForm(EMPTY)
        setSent(true)
      },
      onError: (err) => {
        const data = err?.response?.data
        if (data && typeof data === 'object' && !data.detail) setErrors(data)
        toast.error(apiError(err, 'Could not send your message.'))
      },
    })
  }

  const contactItems = [
    profile?.email && { icon: Mail, label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
    profile?.phone && { icon: Phone, label: 'Phone', value: profile.phone, href: `tel:${profile.phone}` },
    profile?.location && { icon: MapPin, label: 'Location', value: profile.location },
  ].filter(Boolean)

  const socials = [
    { icon: Github, url: profile?.github_url, label: 'GitHub' },
    { icon: Linkedin, url: profile?.linkedin_url, label: 'LinkedIn' },
    { icon: Twitter, url: profile?.x_url, label: 'X' },
    { icon: Globe, url: profile?.website_url, label: 'Website' },
  ].filter((s) => s.url)

  return (
    <div className="container-page py-16">
      <SectionHeading
        eyebrow="Contact"
        title="Let's work together"
        subtitle="Have a question or a project in mind? Send me a message and I'll get back to you."
      />

      <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
        {/* Info */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-bold text-body">Contact details</h3>
            <ul className="mt-5 space-y-4">
              {contactItems.map((item) => (
                <li key={item.label} className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-brand-soft text-accent">
                    <item.icon size={18} />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="font-medium text-body hover:text-accent">{item.value}</a>
                    ) : (
                      <p className="font-medium text-body">{item.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {socials.length > 0 && (
              <div className="mt-6 border-t border-line pt-6">
                <p className="mb-3 text-xs uppercase tracking-wide text-muted">Find me online</p>
                <div className="flex gap-2.5">
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
            )}
          </div>

          {profile?.is_available_for_hire && (
            <div className="card flex items-center gap-3 border-emerald-500/30 bg-emerald-500/5 p-5">
              <CheckCircle2 className="text-emerald-500" size={22} />
              <p className="text-sm font-medium text-body">
                Currently available for new opportunities.
              </p>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="card p-6 sm:p-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-10 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 size={32} />
              </span>
              <h3 className="text-xl font-bold text-body">Message sent!</h3>
              <p className="max-w-sm text-muted">
                Thanks for reaching out. I'll get back to you as soon as I can.
              </p>
              <Button variant="secondary" onClick={() => setSent(false)}>Send another</Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name" htmlFor="name" required error={errors.name?.[0]}>
                  <Input id="name" value={form.name} onChange={set('name')} required placeholder="Your name" />
                </Field>
                <Field label="Email" htmlFor="email" required error={errors.email?.[0]}>
                  <Input id="email" type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" />
                </Field>
              </div>
              <Field label="Subject" htmlFor="subject" required error={errors.subject?.[0]}>
                <Input id="subject" value={form.subject} onChange={set('subject')} required placeholder="What's this about?" />
              </Field>
              <Field label="Message" htmlFor="message" required error={errors.message?.[0]} hint="Between 10 and 2000 characters.">
                <Textarea id="message" rows={6} value={form.message} onChange={set('message')} required placeholder="Tell me about your project…" />
              </Field>
              <Button type="submit" size="lg" loading={sendMessage.isPending} className="w-full">
                <Send size={18} /> Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
