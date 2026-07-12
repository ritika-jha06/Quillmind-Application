import { motion } from 'framer-motion'
import { Sun, Moon, Monitor, Bell, Shield, Key, Palette, Save } from 'lucide-react'
import { useTheme } from '@/hooks'
import { Button, Card } from '@/components/ui'
import toast from 'react-hot-toast'

function Section({ title, icon: Icon, children }) {
  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-sm text-[var(--text-primary)] flex items-center gap-2 pb-3 border-b border-[var(--border-color)]">
        <Icon size={16} className="text-brand-400" /> {title}
      </h3>
      {children}
    </Card>
  )
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
        {desc && <p className="text-xs text-[var(--text-muted)]">{desc}</p>}
      </div>
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-brand-500' : 'bg-[var(--surface-300)]'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
      </div>
    </label>
  )
}

export default function SettingsPage() {
  const { mode, toggle } = useTheme()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Customize your QuillMind experience</p>
      </div>

      {/* Appearance */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Section title="Appearance" icon={Palette}>
          <div>
            <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">Theme</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'light', icon: Sun,     label: 'Light' },
                { id: 'dark',  icon: Moon,    label: 'Dark'  },
                { id: 'system',icon: Monitor, label: 'System'},
              ].map(({ id, icon: Icon, label }) => (
                <button key={id}
                  onClick={() => id !== 'system' && mode !== id && toggle()}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border text-sm font-medium transition-all ${
                    mode === id
                      ? 'border-brand-500 bg-brand-500/10 text-brand-500'
                      : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:border-brand-500/40 hover:bg-[var(--surface-100)]'
                  }`}>
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Section>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Notifications" icon={Bell}>
          <div className="space-y-4">
            <Toggle label="Email Notifications" desc="Receive updates via email" checked={true} onChange={() => {}} />
            <Toggle label="Usage Alerts" desc="Get alerted when nearing limits" checked={false} onChange={() => {}} />
            <Toggle label="New Feature Announcements" desc="Stay updated with new features" checked={true} onChange={() => {}} />
          </div>
        </Section>
      </motion.div>

      {/* Privacy */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Section title="Privacy & Security" icon={Shield}>
          <div className="space-y-4">
            <Toggle label="Save Chat History" desc="Store your conversations locally" checked={true} onChange={() => {}} />
            <Toggle label="Analytics" desc="Help improve QuillMind with anonymous usage data" checked={false} onChange={() => {}} />
          </div>
          <Button variant="danger" size="sm" onClick={() => toast.success('Data cleared')}>
            Clear All Data
          </Button>
        </Section>
      </motion.div>

      {/* API */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Section title="API Configuration" icon={Key}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Backend URL</label>
              <input
                className="input-field font-mono text-xs"
                defaultValue={import.meta.env.VITE_API_URL || 'http://localhost:8000'}
                placeholder="http://localhost:8000"
              />
              <p className="mt-1 text-xs text-[var(--text-muted)]">Override in .env as VITE_API_URL</p>
            </div>
          </div>
          <Button onClick={() => toast.success('Settings saved!')} className="mt-2">
            <Save size={15} /> Save Settings
          </Button>
        </Section>
      </motion.div>
    </div>
  )
}
