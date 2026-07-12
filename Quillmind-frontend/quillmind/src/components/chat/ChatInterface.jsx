import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Send, Copy, RefreshCw, Sparkles, User, Check } from 'lucide-react'
import { Button } from '@/components/ui'
import logo from '@/assets/Quillmind-logo.png'

const SUGGESTED_PROMPTS = [
  'Explain quantum computing in simple terms',
  'Help me understand recursion with examples',
  'What are the key concepts in machine learning?',
  'Summarize the theory of relativity',
]

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className={`typing-dot w-2 h-2 rounded-full bg-brand-400`} />
      ))}
    </div>
  )
}

function MessageBubble({ msg, onCopy, onRegenerate }) {
  const [copied, setCopied] = useState(false)
  const isUser = msg.role === 'user'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    onCopy?.()
  }

  return (
    <motion.div
      className={`chat-bubble flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Avatar */}
      {/* <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold ${ */}
      <div
        className={`flex-shrink-0 flex items-center justify-center ${
          isUser
            ? 'w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-violet-600'
            : 'w-12 h-12'
        }`}
      >
        {/* {isUser ? <User size={14} /> : <Sparkles size={14} />} */}
        {isUser ? (
          <User size={14} />
        ) : (
          <img
            src={logo}
            alt="QuillMind"
            className="w-12 h-12 object-contain"
          />
        )}
      </div>  

      {/* Bubble */}
      <div className={`group max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm ${
          isUser
            ? 'bg-gradient-to-r from-brand-600 to-violet-600 text-white rounded-tr-sm'
            : 'bg-[var(--surface-100)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-tl-sm'
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{msg.content}</p>
          ) : (
            <div className="prose-quill text-sm">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)] transition-all">
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            {onRegenerate && (
              <button onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-100)] transition-all">
                <RefreshCw size={11} />
                Regenerate
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default function ChatInterface({ onSend, messages = [], loading = false, placeholder = 'Ask me anything...', showSuggestions = true }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSubmit = () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    onSend?.(q)
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center pb-20">
            <div>
              {/* <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500/20 to-violet-500/20 border border-brand-500/20 flex items-center justify-center mx-auto mb-4 shadow-glow-sm">
                <Sparkles size={28} className="text-brand-400" />
              </div> */}
              <img
                src={logo}
                alt="QuillMind"
                className="w-24 h-24 object-contain mx-auto mb-4"
              />
              {/* <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">QuillMind AI</h2> */}
              <h2 className="text-3xl font-black gradient-text mb-2">
                Welcome to QuillMind
              </h2>
              <p className="text-base text-[var(--text-muted)]">Your intelligent academic companion</p>
            </div>
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => { setInput(prompt); inputRef.current?.focus() }}
                  className="text-left p-3.5 rounded-xl border border-[var(--border-color)] hover:border-brand-500/40 hover:bg-brand-500/5 transition-all duration-150 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  {prompt}
                </button>
              ))}
            </div> */}
            {/* {isEmpty && showSuggestions && (
              <div className="flex flex-col items-center justify-center h-full text-center">

                <img
                  src={logo}
                  alt="QuillMind"
                  className="w-28 h-28 object-contain mb-6"
                />

                <h2 className="text-4xl font-black gradient-text mb-3">
                  QuillMind AI
                </h2>

                <p className="text-base text-[var(--text-muted)] max-w-md">
                  Your intelligent academic companion
                </p>

              </div>
            )} */}
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              msg={msg}
              onRegenerate={i === messages.length - 1 && msg.role === 'assistant' ? () => onSend?.('__regenerate__') : undefined}
            />
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            {/* <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div> */}
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
              <img
                src={logo}
                alt="QuillMind"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="bg-[var(--surface-100)] border border-[var(--border-color)] rounded-2xl rounded-tl-sm">
              <TypingIndicator />
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4">
        <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-[var(--surface-100)] border border-[var(--border-color)] focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/10 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            rows={1}
            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none outline-none px-2 py-2 max-h-40 overflow-y-auto"
            style={{ lineHeight: '1.5' }}
          />
          <Button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            size="sm"
            className="flex-shrink-0 rounded-xl"
          >
            <Send size={15} />
          </Button>
        </div>
        <p className="text-[10px] text-center text-[var(--text-muted)] mt-2">
          QuillMind can make mistakes. Always verify important information.
        </p>
      </div>
    </div>
  )
}
