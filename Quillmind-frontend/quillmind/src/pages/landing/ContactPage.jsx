import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { Mail, MessageSquare, Send, Github, Linkedin } from 'lucide-react'
import { Input, Button } from '@/components/ui'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    await new Promise((r) => setTimeout(r, 1000))
    toast.success('Message sent! We will get back to you soon.')
    reset()
  }

  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="card flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                <Mail size={18} className="text-brand-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">Email Us</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">support@quillmind.ai</p>
              </div>
            </div>
            <div className="card flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                <Github size={18} className="text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">GitHub</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">github.com/quillmind</p>
              </div>
            </div>
            <div className="card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Linkedin size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-[var(--text-primary)]">LinkedIn</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                linkedin.com/in/your-linkedin-id
              </p>
            </div>
          </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <form onSubmit={handleSubmit(onSubmit)} className="glass-card p-6 space-y-4">
              <Input label="Your Name" placeholder="John Doe" icon={MessageSquare}
                error={errors.name?.message}
                {...register('name', { required: 'Name required' })} />
              <Input label="Email Address" type="email" placeholder="you@example.com" icon={Mail}
                error={errors.email?.message}
                {...register('email', { required: 'Email required' })} />
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Message</label>
                <textarea rows={5} placeholder="How can we help you?"
                  className="input-field resize-none"
                  {...register('message', { required: 'Message required' })} />
                {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message.message}</p>}
              </div>
              <Button type="submit" className="w-full justify-center">
                <Send size={15} /> Send Message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
