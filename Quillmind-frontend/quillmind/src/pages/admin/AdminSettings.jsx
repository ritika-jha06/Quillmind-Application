import { motion } from 'framer-motion'
import { Settings, Server, Key, Bell, Shield, Save } from 'lucide-react'
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

export default function AdminSettings() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Admin Settings</h1>
        <p className="text-sm text-[var(--text-muted)]">Platform-level configuration</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Section title="Backend API" icon={Server}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">API Base URL</label>
              <input className="input-field font-mono text-xs" defaultValue="http://localhost:8000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Request Timeout (ms)</label>
              <input type="number" className="input-field text-xs" defaultValue={60000} />
            </div>
          </div>
        </Section>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Section title="AI Configuration" icon={Key}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Max Tokens Per Request</label>
              <input type="number" className="input-field text-xs" defaultValue={2048} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Default Summary Length</label>
              <select className="input-field text-xs">
                <option value="short">Short</option>
                <option value="medium" selected>Medium</option>
                <option value="long">Long</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Default MCQ Count</label>
              <input type="number" className="input-field text-xs" defaultValue={10} min={1} max={50} />
            </div>
          </div>
        </Section>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Section title="Security" icon={Shield}>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">JWT Token Expiry (hours)</label>
              <input type="number" className="input-field text-xs" defaultValue={24} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Max File Upload Size (MB)</label>
              <input type="number" className="input-field text-xs" defaultValue={50} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Allowed File Types</label>
              <input className="input-field text-xs" defaultValue=".pdf,.doc,.docx,.txt,.jpg,.png,.webp" />
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Comma-separated extensions</p>
            </div>
          </div>
        </Section>
      </motion.div>

      <Button onClick={() => toast.success('Admin settings saved!')} className="w-full justify-center">
        <Save size={15} /> Save All Settings
      </Button>
    </div>
  )
}
