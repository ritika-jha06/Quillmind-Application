// AboutPage.jsx
import { motion } from 'framer-motion'
import { Sparkles, Code2, Cpu, Database } from 'lucide-react'

const STACK = [
  { icon: Code2,    label: 'React + Vite',       desc: 'Modern, fast frontend' },
  { icon: Cpu,      label: 'FastAPI + Groq',      desc: 'AI-powered backend' },
  { icon: Database, label: 'Vector Search',       desc: 'Semantic document search' },
  { icon: Sparkles, label: 'OCR + Vision',        desc: 'Image & handwriting support' },
]

export function AboutPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-glow">
            <Sparkles size={36} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4">
            About <span className="gradient-text">QuillMind</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto mb-12 leading-relaxed">
            QuillMind is a Final Year Project built to democratize AI-assisted learning. It combines a FastAPI backend with Groq LLMs, vector search, and OCR to create the most comprehensive academic AI platform.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {STACK.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-3">
                <Icon size={20} className="text-brand-400" />
              </div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{label}</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">{desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="card text-left max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-3">Mission</h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Education should be accessible and intelligent. QuillMind bridges the gap between raw AI capabilities and real student needs — from answering doubts and reading PDFs, to generating exam questions and creating summaries. Built with love for learners everywhere.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
