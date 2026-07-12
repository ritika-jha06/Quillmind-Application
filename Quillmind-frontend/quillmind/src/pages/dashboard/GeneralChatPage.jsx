import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Trash2, Download } from 'lucide-react'
import ChatInterface from '@/components/chat/ChatInterface'
import { qaAPI } from '@/api'
import toast from 'react-hot-toast'
import logo from '@/assets/Quillmind_logo.png'

export default function GeneralChatPage() {
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(false)

  const handleSend = useCallback(async (question) => {
    if (question === '__regenerate__') {
      // Pop last assistant message and resend the last user question
      const lastUser = [...messages].reverse().find((m) => m.role === 'user')
      if (!lastUser) return
      setMessages((prev) => prev.slice(0, -1))
      question = lastUser.content
    }

    const userMsg = { role: 'user', content: question }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }))
      const res = await qaAPI.ask({ question, history })
      const answer = res.data?.answer || res.data?.response || 'No response received.'
      setMessages((prev) => [...prev, { role: 'assistant', content: answer }])
    } catch (err) {
      toast.error('Failed to get response. Please try again.')
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }, [messages])

  const clearChat = () => {
    setMessages([])
    toast.success('Chat cleared')
  }

  const exportChat = () => {
    const text = messages.map((m) => `${m.role === 'user' ? 'You' : 'QuillMind'}: ${m.content}`).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'quillmind-chat.txt' })
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full h-[calc(100vh-var(--navbar-h)-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">General AI Chat</h1>
          <p className="text-xs text-[var(--text-muted)]">{messages.length} messages in this session</p>
        </div>
        {messages.length > 0 && (
          <div className="flex gap-2">
            <button onClick={exportChat} className="btn-ghost text-xs gap-1.5">
              <Download size={14} /> Export
            </button>
            <button onClick={clearChat} className="btn-ghost text-xs text-red-400 hover:bg-red-500/10 gap-1.5">
              <Trash2 size={14} /> Clear
            </button>
          </div>
        )}
      </div>

      {/* Chat */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 glass-card overflow-hidden h-full"
      >
        <ChatInterface
          messages={messages}
          loading={loading}
          onSend={handleSend}
          placeholder="Ask me anything — science, math, history, coding..."
          showSuggestions={false}
        />
      </motion.div>
    </div>
  )
}
