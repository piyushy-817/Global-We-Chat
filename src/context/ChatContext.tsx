import React, { createContext, useContext, useState, useCallback } from 'react'
import { Chat, Message, Attachment } from '../types'
import { mockChats } from '../data/mockData'
import { generateId } from '../utils/helpers'
import { getAIReply, getSmartReplies } from '../lib/geminiChat'

interface ChatContextType {
  chats: Chat[]
  activeChat: Chat | null
  searchQuery: string
  smartReplies: string[]
  isAILoading: boolean
  setSearchQuery: (q: string) => void
  setActiveChat: (chat: Chat) => void
  sendMessage: (chatId: string, content: string, attachments?: Attachment[]) => void
  markAsRead: (chatId: string) => void
  dismissSmartReplies: () => void
  deleteMessage: (chatId: string, messageId: string) => void
  editMessage: (chatId: string, messageId: string, newContent: string) => void
  clearMessages: (chatId: string) => void
  setBlocked: (chatId: string, blocked: boolean) => void
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>(mockChats)
  const [activeChat, setActiveChatState] = useState<Chat | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [smartReplies, setSmartReplies] = useState<string[]>([])
  const [isAILoading, setIsAILoading] = useState(false)

  const updateChat = useCallback((chatId: string, updater: (c: Chat) => Chat) => {
    setChats(prev => prev.map(c => c.id === chatId ? updater(c) : c))
    setActiveChatState(prev => prev?.id === chatId ? updater(prev) : prev)
  }, [])

  const setActiveChat = useCallback((chat: Chat) => {
    setActiveChatState(chat)
    setSmartReplies([])
    setChats(prev =>
      prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c)
    )
  }, [])

  const sendMessage = useCallback(async (chatId: string, content: string, attachments?: Attachment[]) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat || (!content.trim() && !attachments?.length)) return

    // Determine message type based on attachments
    let messageType: 'text' | 'image' | 'emoji' | 'file' | 'audio' = 'text'
    if (attachments?.length) {
      if (attachments.some(a => a.type === 'audio')) {
        messageType = 'audio'
      } else if (attachments.some(a => a.type === 'image')) {
        messageType = 'image'
      } else {
        messageType = 'file'
      }
    }

    // Add user message
    const userMsg: Message = {
      id: generateId(),
      content: content.trim() || (attachments?.length ? `📎 ${attachments.length} file(s) attached` : ''),
      timestamp: new Date(),
      isOutgoing: true,
      status: 'sent',
      type: messageType,
      attachments,
    }

    updateChat(chatId, c => ({
      ...c,
      messages: [...c.messages, userMsg],
      lastMessage: userMsg.content,
      lastMessageTime: new Date(),
    }))

    setSmartReplies([])
    setIsAILoading(true)

    // Show typing indicator after short delay
    setTimeout(() => {
      updateChat(chatId, c => ({ ...c, isTyping: true }))
    }, 400)

    // Get messages for context (before user msg)
    const contextMessages = [...chat.messages, userMsg]

    try {
      const [aiReply, suggestions] = await Promise.all([
        getAIReply(chat.name, contextMessages, content || 'User sent file(s)'),
        getSmartReplies(chat.name, content || 'File(s) shared', contextMessages),
      ])

      // Small extra delay so typing indicator feels natural
      await new Promise(r => setTimeout(r, 600 + Math.random() * 500))

      const replyMsg: Message = {
        id: generateId(),
        content: aiReply,
        timestamp: new Date(),
        isOutgoing: false,
        status: 'read',
        type: 'text',
      }

      updateChat(chatId, c => ({
        ...c,
        messages: [...c.messages, replyMsg],
        lastMessage: aiReply,
        lastMessageTime: new Date(),
        isTyping: false,
      }))

      setSmartReplies(suggestions)
    } catch {
      updateChat(chatId, c => ({ ...c, isTyping: false }))
    } finally {
      setIsAILoading(false)
    }
  }, [chats, updateChat])

  const markAsRead = useCallback((chatId: string) => {
    updateChat(chatId, c => ({ ...c, unreadCount: 0 }))
  }, [updateChat])

  const dismissSmartReplies = useCallback(() => setSmartReplies([]), [])

  const deleteMessage = useCallback((chatId: string, messageId: string) => {
    updateChat(chatId, c => ({
      ...c,
      messages: c.messages.map(m => m.id === messageId ? { ...m, deleted: true } : m),
    }))
  }, [updateChat])

  const editMessage = useCallback((chatId: string, messageId: string, newContent: string) => {
    updateChat(chatId, c => ({
      ...c,
      messages: c.messages.map(m => m.id === messageId ? { ...m, content: newContent, editedAt: new Date(), isEditing: false } : m),
    }))
  }, [updateChat])

  const clearMessages = useCallback((chatId: string) => {
    updateChat(chatId, c => ({
      ...c,
      messages: [],
      lastMessage: '',
      lastMessageTime: new Date(),
    }))
  }, [updateChat])

  const setBlocked = useCallback((chatId: string, blocked: boolean) => {
    updateChat(chatId, c => ({
      ...c,
      isBlocked: blocked,
      isTyping: blocked ? false : c.isTyping,
    }))
  }, [updateChat])

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      searchQuery,
      smartReplies,
      isAILoading,
      setSearchQuery,
      setActiveChat,
      sendMessage,
      markAsRead,
      dismissSmartReplies,
      deleteMessage,
      editMessage,
      clearMessages,
      setBlocked,
    }}>
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const ctx = useContext(ChatContext)
  if (!ctx) throw new Error('useChat must be used within ChatProvider')
  return ctx
}