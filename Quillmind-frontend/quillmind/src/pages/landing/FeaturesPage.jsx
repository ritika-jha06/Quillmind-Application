// FeaturesPage.jsx
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, FileSearch, BookOpen, FileText, GraduationCap, ArrowRight, Check } from 'lucide-react'

const MODULES = [
  {
    icon: MessageSquare, color: 'from-brand-500 to-brand-600', title: 'General AI Chat',
    desc: 'Have natural conversations with a powerful AI. Ask about any subject, get explanations, or brainstorm ideas.',
    features: ['Multi-turn conversations', 'Markdown-formatted answers', 'Copy & export chats', 'Suggested prompts'],
  },
  {
    icon: FileSearch, color: 'from-violet-500 to-violet-600', title: 'Document Q&A',
    desc: 'Upload any document and get precise AI answers based on its content using vector search technology.',
    features: ['PDF, DOCX support', 'Vector-based search', 'Contextual answers', 'Multiple documents'],
  },
  {
    icon: BookOpen, color: 'from-emerald-500 to-emerald-600', title: 'Reading Application',
    desc: 'A fully-featured document reader with AI insights, page navigation, progress tracking, and in-document chat.',
    features: ['OCR for scanned PDFs', 'Page-by-page reading', 'AI insights per page', 'Progress tracking'],
  },
  {
    icon: FileText, color: 'from-orange-500 to-orange-600', title: 'Summary Maker',
    desc: 'Generate intelligent summaries with key points and concepts from any text or PDF document.',
    features: ['Short / Medium / Long', 'Key points extraction', 'Download summaries', 'Works with any PDF'],
  },
  {
    icon: GraduationCap, color: 'from-pink-500 to-pink-600', title: 'Exam Maker',
    desc: 'Create high-quality MCQ exams with correct answers, distractors, difficulty tags, and explanations.',
    features: ['Up to 25 questions', 'Easy / Medium / Hard', 'Quiz mode + scoreboard', 'Export to text'],
  },
]

export function FeaturesPage() {
  return (
    <div className="py-20 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[var(--text-primary)] mb-4">
            Powerful <span className="gradient-text">AI Features</span>
          </h1>
          <p className="text-[var(--text-muted)] text-lg max-w-xl mx-auto">
            Five deeply integrated AI modules designed for every stage of your academic journey.
          </p>
        </div>
        <div className="space-y-16">
          {MODULES.map(({ icon: Icon, color, title, desc, features }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center ${i % 2 === 1 ? 'md:flex-row-reverse' : ''}`}
            >
              <div className={i % 2 === 1 ? 'md:order-2' : ''}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-glow-sm`}>
                  <Icon size={26} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">{title}</h2>
                <p className="text-[var(--text-muted)] mb-5 leading-relaxed">{desc}</p>
                <ul className="space-y-2 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                      <Check size={15} className="text-emerald-400 flex-shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="btn-primary">
                  Try {title} <ArrowRight size={15} />
                </Link>
              </div>
              <div className={`glass-card p-8 flex items-center justify-center min-h-48 ${i % 2 === 1 ? 'md:order-1' : ''}`}>
                <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${color} flex items-center justify-center shadow-glow`}>
                  <Icon size={42} className="text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FeaturesPage
