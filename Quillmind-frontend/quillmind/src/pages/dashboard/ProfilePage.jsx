import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { User, Mail, Camera, Save, Shield, Activity } from 'lucide-react'
import { useAuth } from '@/hooks'
import { Button, Input, Card, Badge, StatCard } from '@/components/ui'
import { authAPI } from '@/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const fileInputRef = useRef(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await authAPI.profile()

      setProfile(res.data)

      const existingUser =
        JSON.parse(localStorage.getItem('qm_user')) || {}

      localStorage.setItem(
        'qm_user',
        JSON.stringify({
          ...existingUser,
          ...res.data
        })
      )

      reset({
        full_name: res.data.full_name || '',
        email: res.data.email || '',
        bio: res.data.bio || '',
        institution: res.data.institution || '',
      })
    } catch (err) {
      console.error(err)
      toast.error('Failed to load profile')
    }
  }

  // const { register, handleSubmit, formState: { errors } } = useForm({
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm()
  //   defaultValues: { name: user?.name || '', email: user?.email || '' },
  // })

  const onSubmit = async (data) => {
    setSaving(true)
    try {
      // await authAPI.updateProfile(data)
      await authAPI.updateProfile({
        full_name: data.full_name,
        bio: data.bio,
        institution: data.institution,
      })

      await loadProfile()
      window.dispatchEvent(
        new Event('storage')
      )

      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]

    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await authAPI.uploadAvatar(formData)

      setAvatarPreview(
        `http://localhost:8000/${res.data.avatar}`
      )

      await loadProfile()

      toast.success('Profile picture updated')
    } catch (err) {
      console.error(err)
      toast.error('Upload failed')
    }
  }

  // return (
    
  //   <div className="max-w-4xl mx-auto space-y-6">
  return (
  <>
    <input
      type="file"
      accept="image/*"
      ref={fileInputRef}
      onChange={handleAvatarUpload}
      style={{ display: 'none' }}
    />

    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Profile</h1>
        <p className="text-sm text-[var(--text-muted)]">Manage your account information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="flex flex-col items-center text-center p-6 space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-br from-brand-500 to-violet-600 shadow-glow">

                {(avatarPreview || profile?.avatar) ? (
                  <img
                    src={
                      avatarPreview ||
                      `http://localhost:8000/${profile.avatar}`
                    }
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                    {profile?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
            </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[var(--surface-0)] border border-[var(--border-color)] flex items-center justify-center shadow-sm hover:bg-[var(--surface-100)] transition-colors"
              >
                <Camera size={14} className="text-[var(--text-muted)]" />
              </button>
            </div>
            <div>
              <p className="font-bold text-[var(--text-primary)]">{profile?.full_name || profile?.username || 'User'}</p>
              <p className="text-xs text-[var(--text-muted)]">{profile?.email}</p>
            </div>
            <Badge variant="brand"><Shield size={11} /> {profile?.role || 'user'}</Badge>
            <p className="text-xs text-[var(--text-muted)]">Member since {profile?.created_at?.split(' ')[0] || '-'}</p>
          </Card>
        </motion.div>

        {/* Edit form */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="lg:col-span-2">
          <Card>
            <h3 className="font-semibold text-sm text-[var(--text-primary)] mb-5 flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
              <User size={16} className="text-brand-400" /> Personal Information
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input label="Full Name" placeholder="Your full name" icon={User}
                error={errors.full_name?.message}
                {...register('full_name', { required: 'Full name is required' })} />
              <Input label="Email Address" type="email" placeholder="your@email.com" icon={Mail}
                error={errors.email?.message}
                {...register('email', { required: 'Email is required' })} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Bio</label>
                <textarea rows={3} placeholder="Tell us about yourself..."
                  className="input-field resize-none"
                  {...register('bio')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Institution</label>
                <input className="input-field" placeholder="Your university or school" {...register('institution')} />
              </div>
              <Button type="submit" loading={saving}>
                <Save size={15} /> Save Changes
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Stats
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] mb-3 flex items-center gap-2">
          <Activity size={15} /> Usage Statistics
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Chats" value="48" color="brand" />
          <StatCard label="Docs Analyzed" value="12" color="violet" />
          <StatCard label="Summaries" value="23" color="emerald" />
          <StatCard label="Exams Made" value="9" color="yellow" />
        </div>
      </motion.div> */}

      {/* Danger zone */}
      <Card className="border-red-500/20">
        <h3 className="font-semibold text-sm text-red-400 mb-3">Danger Zone</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">These actions are irreversible. Please be careful.</p>
        <div className="flex gap-3 flex-wrap">
          <Button variant="danger" size="sm" onClick={() => toast.error('Feature coming soon')}>Change Password</Button>
          <Button variant="danger" size="sm" onClick={() => toast.error('Contact admin to delete account')}>Delete Account</Button>
        </div>
      </Card>
    </div>
  </>
  )
}
