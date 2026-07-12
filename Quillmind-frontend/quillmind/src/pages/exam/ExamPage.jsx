import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GraduationCap, Type, FileText, Sparkles, CheckCircle2,
  XCircle, Trophy, RotateCcw, Download, ChevronRight, Timer,
} from 'lucide-react'
import { useForm } from 'react-hook-form'
import FileDropzone from '@/components/common/FileDropzone'
import { examAPI } from '@/api'
import { Button, Badge, Skeleton } from '@/components/ui'
import toast from 'react-hot-toast'

/* ─── Single MCQ Card ────────────────────────────────────────── */
function MCQCard({ q, index, quizMode, selected, onSelect, revealed }) {
  const opts = ['A', 'B', 'C', 'D']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="card space-y-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-brand-600/10 text-brand-500 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <p className="text-sm font-medium text-[var(--text-primary)] leading-relaxed">{q.question}</p>
        </div>
        {q.difficulty && (
          <Badge variant={q.difficulty === 'easy' ? 'emerald' : q.difficulty === 'medium' ? 'yellow' : 'red'} className="flex-shrink-0 capitalize">
            {q.difficulty}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {q.options?.map((opt, i) => {
          const letter    = opts[i]
          const isCorrect = letter === q.correct_answer
          const isSelected = selected === letter

          let style = 'border-[var(--border-color)] hover:border-brand-500/40 hover:bg-brand-500/5 text-[var(--text-secondary)]'
          if (quizMode && !revealed) {
            if (isSelected) style = 'border-brand-500 bg-brand-500/10 text-brand-400'
          } else if (revealed || !quizMode) {
            if (isCorrect)  style = 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
            else if (isSelected && !isCorrect) style = 'border-red-500/50 bg-red-500/10 text-red-400'
          }

          return (
            <button
              key={letter}
              onClick={() => quizMode && !revealed && onSelect(letter)}
              disabled={!quizMode || revealed}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left text-sm transition-all duration-150 disabled:cursor-default ${style}`}
            >
              <span className="w-5 h-5 rounded-md bg-[var(--surface-200)] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                {letter}
              </span>
              <span className="flex-1 leading-snug">{opt}</span>
              {(revealed || !quizMode) && isCorrect && <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />}
              {revealed && isSelected && !isCorrect && <XCircle size={14} className="text-red-400 flex-shrink-0" />}
            </button>
          )
        })}
      </div>

      {(revealed || !quizMode) && q.explanation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="flex gap-2 p-3 rounded-xl bg-[var(--surface-100)] border border-[var(--border-color)]"
        >
          <Sparkles size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{q.explanation}</p>
        </motion.div>
      )}
    </motion.div>
  )
}

/* ─── Scoreboard ─────────────────────────────────────────────── */
function Scoreboard({ questions, answers, onReset, onRetry }) {
  const total   = questions.length
  const correct = questions.filter((q, i) => answers[i] === q.correct_answer).length
  const pct     = Math.round((correct / total) * 100)
  const grade   = pct >= 90 ? 'A' : pct >= 75 ? 'B' : pct >= 60 ? 'C' : pct >= 45 ? 'D' : 'F'
  const colors  = { A: 'text-emerald-400', B: 'text-brand-400', C: 'text-yellow-400', D: 'text-orange-400', F: 'text-red-400' }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="glass-card p-8 text-center max-w-md mx-auto"
    >
      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-5">
        <Trophy size={36} className="text-brand-400" />
      </div>
      <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Quiz Complete!</h2>
      <p className="text-[var(--text-muted)] text-sm mb-6">Here's how you did</p>

      <div className="flex items-center justify-center gap-8 mb-6">
        <div>
          <p className={`text-5xl font-bold ${colors[grade]}`}>{grade}</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Grade</p>
        </div>
        <div className="h-12 w-px bg-[var(--border-color)]" />
        <div>
          <p className="text-4xl font-bold text-[var(--text-primary)]">{pct}%</p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Score</p>
        </div>
        <div className="h-12 w-px bg-[var(--border-color)]" />
        <div>
          <p className="text-3xl font-bold text-emerald-400">{correct}<span className="text-lg text-[var(--text-muted)]">/{total}</span></p>
          <p className="text-xs text-[var(--text-muted)] mt-1">Correct</p>
        </div>
      </div>

      <div className="h-3 bg-[var(--surface-200)] rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          className={`h-full rounded-full ${pct >= 60 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}`}
        />
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" onClick={onRetry} className="flex-1 justify-center"><RotateCcw size={15} /> Retry</Button>
        <Button onClick={onReset} className="flex-1 justify-center">New Exam</Button>
      </div>
    </motion.div>
  )
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function ExamPage() {
  const [mode,       setMode]       = useState('text')     // text | pdf
  const [file,       setFile]       = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [questions,  setQuestions]  = useState([])
  const [quizMode,   setQuizMode]   = useState(false)
  const [answers,    setAnswers]    = useState({})         // { index: letter }
  const [revealed,   setRevealed]   = useState({})         // { index: true }
  const [submitted,  setSubmitted]  = useState(false)
  const [quizTimer,  setQuizTimer]  = useState(0)

  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState('mixed')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const handleText = async ({ text, num_questions = 10, difficulty = 'medium' }) => {
    setLoading(true)
    setQuestions([])
    try {
      const res = await examAPI.fromText({ text, num_questions: Number(num_questions), difficulty })
      const qs = (res.data?.questions || []).map(q => ({
        ...q,
        options: Object.values(q.options || {})
      }))

      console.log("Questions received:", qs)
      console.log("First question:", qs[0])

      setQuestions(qs)
      toast.success(`${qs.length} questions generated!`)
    } catch {
      toast.error('Failed to generate exam')
    } finally {
      setLoading(false)
    }
  }

  const handlePdf = async () => {
    if (!file) return
    setLoading(true)
    setQuestions([])
    try {
      // const fd = new FormData()
      // fd.append('file', file)
      // const res = await examAPI.fromPdf(fd)
      const fd = new FormData()

      fd.append('file', file)
      fd.append('number_of_questions', numQuestions)
      fd.append('difficulty', difficulty)

      const res = await examAPI.fromPdf(fd)
      const qs = (res.data?.questions || []).map(q => ({
        ...q,
        options: Object.values(q.options || {})
      }))

      console.log("Questions received:", qs)
      console.log("First question:", qs[0])
      setQuestions(qs)
      toast.success(`${qs.length} questions generated!`)
    } catch {
      toast.error('Failed to generate from PDF')
    } finally {
      setLoading(false)
    }
  }

  const startQuiz = () => {
    setQuizMode(true)
    setAnswers({})
    setRevealed({})
    setSubmitted(false)
  }

  const selectAnswer = (qIndex, letter) => {
    setAnswers((prev) => ({ ...prev, [qIndex]: letter }))
    setRevealed((prev) => ({ ...prev, [qIndex]: true }))
  }

  const submitQuiz = () => {
    setRevealed(Object.fromEntries(questions.map((_, i) => [i, true])))
    setSubmitted(true)
  }

  const resetAll = () => {
    setQuestions([])
    setQuizMode(false)
    setAnswers({})
    setRevealed({})
    setSubmitted(false)
    reset()
  }

  const exportPdf = () => {
    const lines = questions.map((q, i) => {
      const opts = (q.options || []).map((o, j) => `  ${['A','B','C','D'][j]}) ${o}`).join('\n') 
      return `Q${i+1}. ${q.question}\n${opts}\nAnswer: ${q.correct_answer}\n`
    }).join('\n---\n\n')
    const blob = new Blob([`QuillMind Exam\n${'='.repeat(40)}\n\n${lines}`], { type: 'text/plain' })
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'exam.txt' }).click()
  }

  const answeredCount = Object.keys(answers).length

  if (submitted && quizMode) {
    return (
      // <div className="max-w-5xl mx-auto space-y-6">
        <div className="w-full space-y-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Exam Maker</h1>
        </div>
        <Scoreboard questions={questions} answers={answers} onReset={resetAll} onRetry={startQuiz} />
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text-secondary)]">Review All Questions</h3>
          {questions.map((q, i) => (
            <MCQCard key={i} q={q} index={i} quizMode revealed={true} selected={answers[i]} onSelect={() => {}} />
          ))}
        </div>
      </div>
    )
  }

  return (
    // <div className="max-w-5xl mx-auto space-y-6">
      <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">Exam Maker</h1>
          <p className="text-sm text-[var(--text-muted)]">Generate MCQ exams from text or PDF using AI</p>
        </div>
        {questions.length > 0 && !quizMode && (
          <div className="flex gap-2">
            <button onClick={exportPdf} className="btn-ghost text-xs gap-1.5"><Download size={14} /> Export</button>
            <Button size="sm" onClick={startQuiz}><Timer size={14} /> Start Quiz Mode</Button>
          </div>
        )}
        {quizMode && !submitted && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--text-muted)]">{answeredCount}/{questions.length} answered</span>
            <Button size="sm" onClick={submitQuiz} disabled={answeredCount < questions.length}>
              <Trophy size={14} /> Submit Quiz
            </Button>
          </div>
        )}
      </div>

      {/* Generator form */}
      {questions.length === 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {/* Mode selector */}
            <div className="flex gap-2 p-1 bg-[var(--surface-100)] rounded-xl">
              {[
                { id: 'text', icon: Type,     label: 'From Text' },
                { id: 'pdf',  icon: FileText, label: 'From PDF' },
              ].map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setMode(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === id
                      ? 'bg-[var(--surface-0)] text-[var(--text-primary)] shadow-sm border border-[var(--border-color)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                  }`}>
                  <Icon size={15} /> {label}
                </button>
              ))}
            </div>

            {mode === 'text' ? (
              <form onSubmit={handleSubmit(handleText)} className="glass-card p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Topic or Text</label>
                  <textarea rows={8}
                    placeholder="Enter the topic or paste the text you want to create questions from..."
                    className={`input-field resize-none ${errors.text ? 'border-red-500' : ''}`}
                    {...register('text', { required: 'Text is required' })}
                  />
                  {errors.text && <p className="mt-1 text-xs text-red-400">{errors.text.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">No. of Questions</label>
                    <select className="input-field" {...register('num_questions')}>
                      {[5, 10, 15, 20, 25].map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Difficulty</label>
                    <select className="input-field" {...register('difficulty')}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="mixed">Mixed</option>
                    </select>
                  </div>
                </div>
                <Button type="submit" loading={loading} className="w-full justify-center">
                  <GraduationCap size={16} /> Generate Exam
                </Button>
              </form>
            ) : (
              <div className="glass-card p-5 space-y-4">
                <FileDropzone
                  onFileSelect={setFile}
                  accept={{ 'application/pdf': ['.pdf'] }}
                  label="Drop your PDF here"
                  hint="PDF up to 20MB"
                />
                <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    No. of Questions
                  </label>

                  <select
                    className="input-field"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                  >
                    {[5,10,15,20,25,30,40,50].map(n => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Difficulty
                  </label>

                  <select
                    className="input-field"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="mixed">Mixed</option>
                  </select>
                </div>
              </div>
                <Button loading={loading} onClick={handlePdf} disabled={!file} className="w-full justify-center">
                  <GraduationCap size={16} /> Generate from PDF
                </Button>
              </div>
            )}
          </div>

          {/* Illustration */}
          <div className="glass-card p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-500/15 flex items-center justify-center mb-5 shadow-glow-sm">
              <GraduationCap size={36} className="text-brand-400" />
            </div>
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">AI-Powered Exam Creator</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-xs leading-relaxed">
              Generate high-quality MCQ questions with correct answers, distractors, and explanations — instantly.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 w-full max-w-xs">
              {[
                ['✅', 'Answer keys'],
                ['📊', 'Difficulty tags'],
                ['💡', 'Explanations'],
                ['🎯', 'Quiz mode'],
              ].map(([emoji, label]) => (
                <div key={label} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--surface-100)] text-xs text-[var(--text-secondary)]">
                  <span>{emoji}</span>{label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        // <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card space-y-3">
              <Skeleton className="h-5 w-4/5" />
              <Skeleton lines={4} />
            </div>
          ))}
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && !loading && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="brand">{questions.length} Questions</Badge>
              {quizMode && <Badge variant="violet">Quiz Mode Active</Badge>}
            </div>
            <button onClick={resetAll} className="btn-ghost text-xs gap-1.5 text-red-400 hover:bg-red-500/10">
              <RotateCcw size={13} /> New Exam
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, i) => (
              <MCQCard
                key={i}
                q={q}
                index={i}
                quizMode={quizMode}
                selected={answers[i]}
                revealed={revealed[i]}
                onSelect={(letter) => selectAnswer(i, letter)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
