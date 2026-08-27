import { useState } from 'react'
import { Save, Upload, FileText, User, KeyRound, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api, { apiError } from '@/lib/api'
import { useProfile, useUpdateProfile } from '@/hooks/usePortfolio'
import { usePageMeta } from '@/hooks/usePageMeta'
import { PageHeader } from '@/components/dashboard/DashUI'
import { Field, Input, Textarea, Checkbox } from '@/components/ui/Form'
import Button from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import { Loading } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/States'

const EMPTY = {
  full_name: '', headline: '', bio: '', email: '', phone: '', location: '',
  github_url: '', linkedin_url: '', x_url: '', website_url: '',
  years_of_experience: 0, is_available_for_hire: true,
}

export default function ProfileManager() {
  const { data: profile, isLoading, isError, refetch } = useProfile()
  const updateProfile = useUpdateProfile()

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [resumeFile, setResumeFile] = useState(null)
  const [hydrated, setHydrated] = useState(false)

  usePageMeta('Profile')

  // Hydrate the form once the profile has loaded (render-phase, populated before
  // first paint). One-shot, so it never clobbers unsaved edits on a refetch.
  if (profile && !hydrated) {
    setHydrated(true)
    setForm({
      full_name: profile.full_name || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      github_url: profile.github_url || '',
      linkedin_url: profile.linkedin_url || '',
      x_url: profile.x_url || '',
      website_url: profile.website_url || '',
      years_of_experience: profile.years_of_experience ?? 0,
      is_available_for_hire: !!profile.is_available_for_hire,
    })
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const err = (k) => (Array.isArray(errors[k]) ? errors[k][0] : errors[k])

  const onAvatar = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const submit = (e) => {
    e.preventDefault()
    setErrors({})
    const hasFiles = avatarFile || resumeFile
    let payload
    if (hasFiles) {
      payload = new FormData()
      Object.entries(form).forEach(([k, v]) => payload.append(k, v))
      if (avatarFile) payload.append('avatar', avatarFile)
      if (resumeFile) payload.append('resume', resumeFile)
    } else {
      payload = { ...form, years_of_experience: Number(form.years_of_experience) || 0 }
    }
    updateProfile.mutate(payload, {
      onSuccess: () => {
        toast.success('Profile saved')
        setAvatarFile(null)
        setResumeFile(null)
      },
      onError: (er) => {
        const d = er?.response?.data
        if (d && typeof d === 'object' && !Array.isArray(d)) setErrors(d)
        toast.error(apiError(er, 'Please fix the errors and try again.'))
      },
    })
  }

  if (isLoading) return <Loading label="Loading profile…" />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div>
      <PageHeader title="Profile" subtitle="This is the information shown across your public site.">
        <Button type="submit" form="profile-form" size="sm" loading={updateProfile.isPending}>
          <Save size={16} /> Save changes
        </Button>
      </PageHeader>

      <form id="profile-form" onSubmit={submit} className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Left: avatar + resume + availability */}
        <div className="space-y-5">
          <div className="card p-6 text-center">
            <Avatar src={avatarPreview || profile?.avatar} name={form.full_name} size={112} className="mx-auto text-2xl" />
            <label className="btn-secondary mt-4 w-full cursor-pointer">
              <Upload size={15} /> Change photo
              <input type="file" accept="image/*" onChange={onAvatar} className="hidden" />
            </label>
            {avatarFile && <p className="mt-2 truncate text-xs text-muted">{avatarFile.name}</p>}
            {err('avatar') && <p className="mt-2 text-xs font-medium text-red-500">{err('avatar')}</p>}
          </div>

          <div className="card p-6">
            <span className="label">Résumé (PDF)</span>
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line px-4 py-4 text-muted hover:border-accent/40 hover:text-accent">
              <FileText size={20} />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">
                {resumeFile ? resumeFile.name : profile?.resume ? 'Replace résumé' : 'Upload résumé'}
              </span>
              <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} className="hidden" />
            </label>
            {profile?.resume && !resumeFile && (
              <a href={profile.resume} target="_blank" rel="noreferrer noopener" className="mt-2 inline-block text-xs font-medium text-accent hover:underline">
                View current résumé
              </a>
            )}
            {err('resume') && <p className="mt-2 text-xs font-medium text-red-500">{err('resume')}</p>}
          </div>

          <div className="card p-6">
            <Checkbox
              checked={form.is_available_for_hire}
              onChange={(e) => setForm((f) => ({ ...f, is_available_for_hire: e.target.checked }))}
              label={<span className="inline-flex items-center gap-1.5"><CheckCircle2 size={15} /> Available for hire</span>}
            />
            <p className="mt-2 text-xs text-muted">Shows an “available” badge on your homepage.</p>
          </div>
        </div>

        {/* Right: fields */}
        <div className="space-y-5">
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold text-body"><User size={17} /> Basic info</h3>
            <div className="space-y-4">
              <Field label="Full name" htmlFor="full_name" required error={err('full_name')}>
                <Input id="full_name" value={form.full_name} onChange={set('full_name')} required />
              </Field>
              <Field label="Headline" htmlFor="headline" error={err('headline')} hint="e.g. Full-stack developer & open-source enthusiast">
                <Input id="headline" value={form.headline} onChange={set('headline')} />
              </Field>
              <Field label="Bio" htmlFor="bio" error={err('bio')} hint="Separate paragraphs with a blank line.">
                <Textarea id="bio" rows={6} value={form.bio} onChange={set('bio')} />
              </Field>
              <Field label="Years of experience" htmlFor="yoe" error={err('years_of_experience')}>
                <Input id="yoe" type="number" min={0} value={form.years_of_experience} onChange={set('years_of_experience')} />
              </Field>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-bold text-body">Contact</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" htmlFor="email" error={err('email')}>
                <Input id="email" type="email" value={form.email} onChange={set('email')} />
              </Field>
              <Field label="Phone" htmlFor="phone" error={err('phone')}>
                <Input id="phone" value={form.phone} onChange={set('phone')} />
              </Field>
              <Field label="Location" htmlFor="location" error={err('location')} className="sm:col-span-2">
                <Input id="location" value={form.location} onChange={set('location')} placeholder="e.g. Dhaka, Bangladesh" />
              </Field>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="mb-4 font-bold text-body">Social links</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="GitHub" htmlFor="github" error={err('github_url')}>
                <Input id="github" type="url" value={form.github_url} onChange={set('github_url')} placeholder="https://github.com/…" />
              </Field>
              <Field label="LinkedIn" htmlFor="linkedin" error={err('linkedin_url')}>
                <Input id="linkedin" type="url" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/…" />
              </Field>
              <Field label="X (Twitter)" htmlFor="x" error={err('x_url')}>
                <Input id="x" type="url" value={form.x_url} onChange={set('x_url')} placeholder="https://x.com/…" />
              </Field>
              <Field label="Website" htmlFor="website" error={err('website_url')}>
                <Input id="website" type="url" value={form.website_url} onChange={set('website_url')} placeholder="https://…" />
              </Field>
            </div>
          </div>
        </div>
      </form>

      <ChangePassword />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Change password — posts directly to /auth/change-password/.                */
/* -------------------------------------------------------------------------- */
function ChangePassword() {
  const [form, setForm] = useState({ old_password: '', new_password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const err = (k) => (Array.isArray(errors[k]) ? errors[k][0] : errors[k])

  const submit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.new_password !== form.confirm) {
      setErrors({ confirm: 'Passwords do not match.' })
      return
    }
    setSaving(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: form.old_password,
        new_password: form.new_password,
      })
      toast.success('Password changed')
      setForm({ old_password: '', new_password: '', confirm: '' })
    } catch (er) {
      const d = er?.response?.data
      if (d && typeof d === 'object' && !Array.isArray(d)) setErrors(d)
      toast.error(apiError(er, 'Could not change password.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="card mt-6 p-6">
      <h3 className="mb-1 flex items-center gap-2 font-bold text-body"><KeyRound size={17} /> Change password</h3>
      <p className="mb-4 text-sm text-muted">Update the password for your owner account.</p>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Current password" htmlFor="old_password" required error={err('old_password')}>
          <Input id="old_password" type="password" value={form.old_password} onChange={set('old_password')} autoComplete="current-password" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="New password" htmlFor="new_password" required error={err('new_password')} hint="At least 8 characters.">
            <Input id="new_password" type="password" value={form.new_password} onChange={set('new_password')} autoComplete="new-password" required />
          </Field>
          <Field label="Confirm new password" htmlFor="confirm" required error={err('confirm')}>
            <Input id="confirm" type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" required />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" size="sm" loading={saving}>Update password</Button>
        </div>
      </form>
    </div>
  )
}
