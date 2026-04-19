import { useEffect, useRef, useState } from 'react'
import { useChat } from '../../context/ChatContext'
import ChatHeader from './ChatHeader'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import SmartReplies from './SmartReplies'
import { isToday, isYesterday, format, isSameDay } from 'date-fns'
import { MessageCircle, Ban } from 'lucide-react'

function getDateLabel(date: Date): string {
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'MMMM d, yyyy')
}

export default function ChatWindow() {
  const { activeChat, deleteMessage, editMessage, clearMessages, setBlocked } = useChat()
  const bottomRef = useRef<HTMLDivElement>(null)
  const [highlightQuery, setHighlightQuery] = useState('')
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null)
  const [matchIds, setMatchIds] = useState<string[]>([])
  const [matchIndex, setMatchIndex] = useState(0)

  const scrollToMessageId = (id: string) => {
    setHighlightedMessageId(id)
    const messageElement = document.querySelector(`[data-message-id="${id}"]`)
    messageElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handleSearch = (query: string) => {
    if (!activeChat) return

    const trimmed = query.trim()
    setHighlightQuery(trimmed)
    if (!trimmed) {
      setHighlightedMessageId(null)
      setMatchIds([])
      setMatchIndex(0)
      return
    }

    const q = trimmed.toLowerCase()
    const ids = activeChat.messages
      .filter(msg => msg.content?.toLowerCase().includes(q))
      .map(m => m.id)

    setMatchIds(ids)
    if (!ids.length) {
      setHighlightedMessageId(null)
      setMatchIndex(0)
      return
    }

    setMatchIndex(0)
    scrollToMessageId(ids[0])
  }

  const handleSearchNext = () => {
    if (!matchIds.length) return
    const next = (matchIndex + 1) % matchIds.length
    setMatchIndex(next)
    scrollToMessageId(matchIds[next])
  }

  const handleSearchPrev = () => {
    if (!matchIds.length) return
    const prev = (matchIndex - 1 + matchIds.length) % matchIds.length
    setMatchIndex(prev)
    scrollToMessageId(matchIds[prev])
  }

  const handleClearMessages = () => {
    if (activeChat) {
      clearMessages(activeChat.id)
    }
  }

  const handleBlockChange = (blocked: boolean) => {
    if (activeChat) {
      setBlocked(activeChat.id, blocked)
    }
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages])

  useEffect(() => {
    setHighlightQuery('')
    setHighlightedMessageId(null)
    setMatchIds([])
    setMatchIndex(0)
  }, [activeChat?.id])

  if (!activeChat) return null

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <ChatHeader 
        chat={activeChat} 
        onClearMessages={handleClearMessages}
        onBlockChange={handleBlockChange}
        onSearch={handleSearch}
        onSearchNext={handleSearchNext}
        onSearchPrev={handleSearchPrev}
        searchResultIndex={matchIds.length ? matchIndex + 1 : 0}
        searchResultTotal={matchIds.length}
      />

      <div className="flex-1 overflow-y-auto px-[5%] py-4 chat-bg">
        {activeChat.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-sm px-6">
              {activeChat.isBlocked ? (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
                    <Ban size={28} className="text-wa-text-secondary" />
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-wa-text-primary">You blocked this contact</h3>
                  <p className="mt-2 text-[13px] text-wa-text-secondary">
                    To start messaging again, unblock from the menu.
                  </p>
                </>
              ) : (
                <>
                  <div className="mx-auto w-16 h-16 rounded-full bg-white/70 flex items-center justify-center shadow-sm">
                    <MessageCircle size={28} className="text-wa-text-secondary" />
                  </div>
                  <h3 className="mt-4 text-[16px] font-semibold text-wa-text-primary">Start your conversation</h3>
                  <p className="mt-2 text-[13px] text-wa-text-secondary">
                    Send a message to begin chatting.
                  </p>
                </>
              )}
            </div>
          </div>
        ) : (
          activeChat.messages.map((msg, idx) => {
            const prev = activeChat.messages[idx - 1]
            const showDivider = !prev || !isSameDay(prev.timestamp, msg.timestamp)
            return (
              <MessageBubble
                key={msg.id}
                message={msg}
                highlightQuery={highlightQuery}
                isHighlighted={highlightedMessageId === msg.id}
                showDateDivider={showDivider}
                dividerLabel={showDivider ? getDateLabel(msg.timestamp) : undefined}
                onDelete={(messageId) => deleteMessage(activeChat.id, messageId)}
                onEdit={(messageId, newContent) => editMessage(activeChat.id, messageId, newContent)}
              />
            )
          })
        )}

        {activeChat.isTyping && (
          <div className="flex justify-start mb-2">
            <div className="bg-white message-in px-4 py-3 shadow-sm flex items-center gap-1">
              <span className="typing-dot w-2 h-2 bg-wa-text-secondary rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-wa-text-secondary rounded-full inline-block" />
              <span className="typing-dot w-2 h-2 bg-wa-text-secondary rounded-full inline-block" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <SmartReplies chatId={activeChat.id} />
      <MessageInput chatId={activeChat.id} />
    </div>
  )
}