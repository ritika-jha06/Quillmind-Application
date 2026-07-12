import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, ArrowRight, MessageSquare, FileSearch, BookOpen,
  FileText, GraduationCap, Zap, Shield, Globe, Star,
} from 'lucide-react'

const FEATURES = [
  { icon: MessageSquare, title: 'General AI Chat',  desc: 'Intelligent conversations for any academic topic — explanations, doubts, and brainstorming.', color: 'from-brand-500 to-brand-600' },
  { icon: FileSearch,    title: 'Document Q&A',     desc: 'Upload PDFs and ask any question. AI searches through your document and answers precisely.', color: 'from-violet-500 to-violet-600' },
  { icon: BookOpen,      title: 'Reading App',      desc: 'Smart page-by-page reading with AI insights, progress tracking, and in-document chat.', color: 'from-emerald-500 to-emerald-600' },
  { icon: FileText,      title: 'Summary Maker',    desc: 'Generate concise summaries with key points from any text or PDF document instantly.', color: 'from-orange-500 to-orange-600' },
  { icon: GraduationCap, title: 'Exam Maker',       desc: 'Create MCQ exams with correct answers, difficulty levels, and explanations from any topic.', color: 'from-pink-500 to-pink-600' },
]

const TESTIMONIALS = [
  { name: 'Priya Sharma',    role: 'B.Tech CS Student',     text: 'QuillMind helped me clear my semester exams with its amazing exam generator and summaries!', stars: 5 },
  { name: 'Rohan Mehta',     role: 'UPSC Aspirant',         text: 'The reading app is incredible. AI insights on each page saved me hours of study time.', stars: 5 },
  { name: 'Sneha Kulkarni',  role: 'MBA Student',           text: 'Document Q&A is a game-changer. I uploaded my case studies and got perfect answers.', stars: 5 },
]

const container = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }
const fadeUp = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } }

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        {/* Background */}
        <div className="absolute inset-0 bg-mesh-light dark:bg-mesh-dark" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 max-w-5xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-brand-500/20 text-brand-500 text-xs font-semibold mb-8"
          >
            <Sparkles size={13} /> AI-Powered Academic Assistant · Now Available
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-[var(--text-primary)] leading-tight mb-6"
          >
            Study Smarter with{' '}
            <span className="gradient-text">QuillMind AI</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Your all-in-one AI academic companion. Chat with AI, analyze documents, read smarter, generate summaries, and create exams — all in one platform.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-glow hover:shadow-glow-lg">
              Get Started Free <ArrowRight size={18} />
            </Link>
            <Link to="/features" className="btn-ghost text-base px-8 py-3 border border-[var(--border-color)] rounded-xl">
              Explore Features
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-6 mt-12"
          >
            <div className="flex -space-x-2">
              {['A','B','C','D','E'].map((l) => (
                <div key={l} className="w-8 h-8 rounded-full border-2 border-[var(--surface-0)] bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                  {l}
                </div>
              ))}
            </div>
            <p className="text-sm text-[var(--text-muted)]">
              <span className="font-bold text-[var(--text-primary)]">10,000+</span> students already learning smarter
            </p>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-[var(--text-muted)]"
        >
          <div className="w-5 h-8 rounded-full border-2 border-[var(--border-color)] flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 bg-brand-500 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 px-4 bg-[var(--surface-50)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl font-bold text-[var(--text-primary)] mb-4"
            >
              Everything you need to <span className="gradient-text">excel academically</span>
            </motion.h2>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Five powerful AI modules working together to supercharge your learning journey.
            </p>
          </div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <motion.div key={title} variants={fadeUp}
                className="card hover:shadow-md hover:border-brand-500/20 transition-all duration-200 group">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 shadow-glow-sm group-hover:shadow-glow transition-shadow`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{desc}</p>
              </motion.div>
            ))}

            {/* CTA card */}
            <motion.div variants={fadeUp}>
              <Link to="/register" className="block h-full card bg-gradient-to-br from-brand-950 via-violet-950 to-slate-950 border-0 group hover:shadow-glow transition-all duration-200">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-colors">
                  <Zap size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Get Started Now</h3>
                <p className="text-sm text-white/50 leading-relaxed mb-4">Join thousands of students and start your AI learning journey today.</p>
                <span className="text-brand-400 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                  Create free account <ArrowRight size={15} />
                </span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Why QuillMind ── */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Built for <span className="gradient-text">serious learners</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Zap,    title: 'Lightning Fast',     desc: 'Powered by Groq — get AI responses in milliseconds, not minutes.' },
              { icon: Shield, title: 'Private & Secure',   desc: 'Your documents and chats are never shared. Full data privacy guaranteed.' },
              { icon: Globe,  title: 'Works Everywhere',   desc: 'Fully responsive. Use on desktop, tablet, or mobile seamlessly.' },
            ].map(({ icon: Icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                  <Icon size={26} className="text-brand-400" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 px-4 bg-[var(--surface-50)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">Loved by students everywhere</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, stars }, i) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: stars }).map((_, j) => (
                    <Star key={j} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">"{text}"</p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold">
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)]">{name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-12 overflow-hidden bg-gradient-to-br from-brand-950 via-violet-950 to-slate-950"
          >
            <div className="absolute inset-0 bg-mesh-dark opacity-50" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Start learning smarter <span className="gradient-text">today</span>
              </h2>
              <p className="text-white/60 mb-8 text-lg">
                Join 10,000+ students. Free to start, no credit card needed.
              </p>
              <Link to="/register" className="btn-primary text-base px-8 py-3 shadow-glow hover:shadow-glow-lg">
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border-color)] py-12 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-violet-600 flex items-center justify-center">
              <Sparkles size={13} className="text-white" />
            </div>
            <span className="font-bold gradient-text">QuillMind</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            © {new Date().getFullYear()} QuillMind. Built with FastAPI + React + Groq.
          </p>
          <div className="flex gap-6">
            {[['Privacy', '#'], ['Terms', '#'], ['Contact', '/contact']].map(([label, href]) => (
              <Link key={label} to={href} className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
