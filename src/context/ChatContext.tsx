import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth'
import { Chat, Message, Attachment, User } from '../types'
import { getAIReply, getSmartReplies } from '../lib/geminiChat'
import { auth, googleProvider } from '../lib/firebase'
import {
  DBMessage,
  DBUser,
  clearChatMessages,
  editMessage as editFirestoreMessage,
  ensureDirectChat,
  ensureBotUser,
  listenMessages,
  listenTyping,
  listenUsers,
  markMessageAsRead,
  sendFirestoreMessage,
  setPresence,
  reactToMessage,
  softDeleteMessage,
  updateTyping,
  uploadAttachment,
  upsertUser,
} from '../lib/chatService'

interface AvailableContact {
  id: string
  name: string
  avatar: string
  about?: string
  isOnline?: boolean
}

const STATIC_DEMO_CONTACTS: DBUser[] = [
  { id: 'demo-riya', displayName: 'Riya Sharma', about: 'Living life one chai at a time', phone: '+91 98765 12345', isOnline: true },
  { id: 'demo-arjun', displayName: 'Arjun Mehta', about: 'Code. Coffee. Repeat.', phone: '+91 87654 32109', isOnline: false },
  { id: 'demo-priya', displayName: 'Priya Patel', about: 'Wanderlust and coffee addict', phone: '+91 76543 21098', isOnline: true },
]

interface ChatContextType {
  chats: Chat[]
  activeChat: Chat | null
  currentUser: User | null
  isAuthLoading: boolean
  searchQuery: string
  smartReplies: string[]
  isAILoading: boolean
  replyTarget: Message | null
  availableContacts: AvailableContact[]
  setSearchQuery: (q: string) => void
  setActiveChat: (chat: Chat) => void
  sendMessage: (chatId: string, content: string, attachments?: Attachment[]) => Promise<void>
  markAsRead: (chatId: string) => void
  dismissSmartReplies: () => void
  deleteMessage: (chatId: string, messageId: string) => Promise<void>
  editMessage: (chatId: string, messageId: string, newContent: string) => Promise<void>
  clearMessages: (chatId: string) => Promise<void>
  setBlocked: (chatId: string, blocked: boolean) => void
  setReplyTarget: (message: Message | null) => void
  setReaction: (chatId: string, messageId: string, emoji: string) => Promise<void>
  setTypingState: (chatId: string, typing: boolean) => Promise<void>
  createOrOpenChatWithUser: (userId: string) => Promise<void>
  seedDemoChats: () => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const ChatContext = createContext<ChatContextType | null>(null)

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([])
  const [activeChat, setActiveChatState] = useState<Chat | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [smartReplies, setSmartReplies] = useState<string[]>([])
  const [isAILoading, setIsAILoading] = useState(false)
  const [replyTarget, setReplyTarget] = useState<Message | null>(null)
  const [usersById, setUsersById] = useState<Record<string, DBUser>>({})
  const [chatIdsByPeer, setChatIdsByPeer] = useState<Record<string, string>>({})
  const botUserId = import.meta.env.VITE_BOT_USER_ID || 'ai-bot'
  const demoContactsById = useMemo(
    () => STATIC_DEMO_CONTACTS.reduce<Record<string, DBUser>>((acc, contact) => {
      acc[contact.id] = contact
      return acc
    }, {}),
    []
  )

  const mapDbMessage = useCallback((m: DBMessage, meId: string): Message => ({
    id: m.id || '',
    content: m.content || '',
    timestamp: m.timestamp?.toDate?.() ?? new Date(),
    isOutgoing: m.senderId === meId,
    senderId: m.senderId,
    status: m.status || 'sent',
    type: m.type || 'text',
    attachments: m.attachments,
    deleted: m.deleted,
    editedAt: m.editedAt?.toDate?.(),
    replyToMessageId: m.replyToMessageId,
    replyToSnippet: m.replyToSnippet,
    reactions: m.reactions ?? {},
  }), [])

  const contacts = useMemo(() => {
    if (!currentUser) return []
    const liveContacts = Object.values(usersById).filter(u => u.id !== currentUser.id)
    const botContact: DBUser = {
      id: botUserId,
      displayName: 'Ai Bot',
      about: 'Chat with me for AI replies',
      isOnline: true,
    }
    const mergedById: Record<string, DBUser> = {}
    for (const c of [...liveContacts, ...STATIC_DEMO_CONTACTS, botContact]) {
      mergedById[c.id] = c
    }
    return Object.values(mergedById)
  }, [botUserId, currentUser, usersById])
  const availableContacts = useMemo<AvailableContact[]>(
    () =>
      contacts.map(c => ({
        id: c.id,
        name: c.displayName,
        avatar: (c.displayName || 'U').slice(0, 2).toUpperCase(),
        about: c.about,
        isOnline: !!c.isOnline,
      })),
    [contacts]
  )

  const updateChat = useCallback((chatId: string, updater: (c: Chat) => Chat) => {
    setChats(prev => prev.map(c => c.id === chatId ? updater(c) : c))
    setActiveChatState(prev => prev?.id === chatId ? updater(prev) : prev)
  }, [])

  const setActiveChat = useCallback((chat: Chat) => {
    setActiveChatState(chat)
    setSmartReplies([])
    setReplyTarget(null)
    setChats(prev =>
      prev.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c)
    )
  }, [])

  const sendMessage = useCallback(async (chatId: string, content: string, attachments?: Attachment[]) => {
    const chat = chats.find(c => c.id === chatId)
    if (!chat || !currentUser || (!content.trim() && !attachments?.length)) return

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

    const uploadedAttachments = attachments?.length
      ? await Promise.all(attachments.map(att => uploadAttachment(currentUser.id, att)))
      : undefined

    const payloadContent = content.trim() || (uploadedAttachments?.length ? `📎 ${uploadedAttachments.length} file(s) attached` : '')

    await sendFirestoreMessage(chatId, {
      senderId: currentUser.id,
      content: payloadContent,
      status: 'sent',
      type: messageType,
      attachments: uploadedAttachments,
      replyToMessageId: replyTarget?.id,
      replyToSnippet: replyTarget?.content?.slice(0, 80),
    })
    setReplyTarget(null)
    await updateTyping(chatId, currentUser.id, false)

    setSmartReplies([])

    const peer = chat.participants?.find(id => id !== currentUser.id)
    if (peer === botUserId) {
      setIsAILoading(true)
      try {
        const aiReply = await getAIReply('AI Bot', chat.messages, payloadContent)
        await sendFirestoreMessage(chatId, {
          senderId: botUserId,
          content: aiReply,
          status: 'read',
          type: 'text',
        })
      } finally {
        setIsAILoading(false)
      }
    }
  }, [chats, currentUser, replyTarget, botUserId])

  const markAsRead = useCallback((chatId: string) => {
    updateChat(chatId, c => ({ ...c, unreadCount: 0 }))
  }, [updateChat])

  const dismissSmartReplies = useCallback(() => setSmartReplies([]), [])

  const deleteMessage = useCallback(async (chatId: string, messageId: string) => {
    await softDeleteMessage(chatId, messageId)
  }, [updateChat])

  const editMessage = useCallback(async (chatId: string, messageId: string, newContent: string) => {
    await editFirestoreMessage(chatId, messageId, newContent)
  }, [updateChat])

  const clearMessages = useCallback(async (chatId: string) => {
    await clearChatMessages(chatId)
  }, [updateChat])

  const setBlocked = useCallback((chatId: string, blocked: boolean) => {
    updateChat(chatId, c => ({
      ...c,
      isBlocked: blocked,
      isTyping: blocked ? false : c.isTyping,
    }))
  }, [updateChat])

  const setReaction = useCallback(async (chatId: string, messageId: string, emoji: string) => {
    if (!currentUser) return
    const message = chats.find(c => c.id === chatId)?.messages.find(m => m.id === messageId)
    const next = { ...(message?.reactions || {}), [currentUser.id]: emoji }
    await reactToMessage(chatId, messageId, currentUser.id, emoji)
    // best-effort local update to keep UI responsive
    updateChat(chatId, c => ({
      ...c,
      messages: c.messages.map(m => m.id === messageId ? { ...m, reactions: next } : m),
    }))
  }, [chats, currentUser, updateChat])

  const setTypingState = useCallback(async (chatId: string, typing: boolean) => {
    if (!currentUser) return
    await updateTyping(chatId, currentUser.id, typing)
  }, [currentUser])

  const createOrOpenChatWithUser = useCallback(async (userId: string) => {
    if (!currentUser) return
    const chatId = await ensureDirectChat([currentUser.id, userId])
    const existing = chats.find(c => c.id === chatId)
    if (existing) {
      setActiveChat(existing)
      return
    }

    const contact = usersById[userId] || demoContactsById[userId]
    if (!contact) return

    const placeholder: Chat = {
      id: chatId,
      name: contact.displayName || 'New chat',
      avatar: (contact.displayName || 'U').slice(0, 2).toUpperCase(),
      lastMessage: 'Say hi!',
      lastMessageTime: new Date(),
      unreadCount: 0,
      isOnline: !!contact.isOnline,
      isTyping: false,
      messages: [],
      isMuted: false,
      isPinned: false,
      phone: contact.phone || '',
      about: contact.about || '',
      participants: [currentUser.id, userId],
      lastSeenAt: contact.lastSeenAt?.toDate?.() || null,
    }
    setChats(prev => [placeholder, ...prev])
    setActiveChat(placeholder)
  }, [chats, currentUser, demoContactsById, setActiveChat, usersById])

  const seedDemoChats = useCallback(async () => {
    if (!currentUser) return

    for (const demo of STATIC_DEMO_CONTACTS) {
      const chatId = await ensureDirectChat([currentUser.id, demo.id])
      const existing = chats.find(c => c.id === chatId)
      if (existing?.messages.length) continue

      await sendFirestoreMessage(chatId, {
        senderId: demo.id,
        content: `Hey ${currentUser.name.split(' ')[0]}! Good to see your new WhatsApp clone.`,
        status: 'delivered',
        type: 'text',
      })
      await sendFirestoreMessage(chatId, {
        senderId: currentUser.id,
        content: 'Thanks! Testing edit/delete/reply/reactions now.',
        status: 'read',
        type: 'text',
      })
      await sendFirestoreMessage(chatId, {
        senderId: demo.id,
        content: 'Nice. Try long-press menu actions on your message.',
        status: 'delivered',
        type: 'text',
      })
    }
  }, [chats, currentUser])

  const loginWithGoogle = useCallback(async () => {
    await signInWithPopup(auth, googleProvider)
  }, [])

  const logout = useCallback(async () => {
    if (currentUser) {
      await setPresence(currentUser.id, false)
    }
    await signOut(auth)
  }, [currentUser])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      setIsAuthLoading(false)
      if (!user) {
        setCurrentUser(null)
        setChats([])
        setActiveChatState(null)
        return
      }
      const me: User = {
        id: user.uid,
        name: user.displayName || 'User',
        avatar: user.photoURL || (user.displayName || 'U').slice(0, 2).toUpperCase(),
        phone: user.phoneNumber || '',
        about: 'Available',
        email: user.email || '',
      }
      setCurrentUser(me)
      await upsertUser(me)
      await ensureBotUser(botUserId)
      await setPresence(me.id, true)
    })
    return () => unsub()
  }, [botUserId])

  useEffect(() => {
    if (!currentUser) return
    const unsub = listenUsers(async (users) => {
      const next = users.reduce<Record<string, DBUser>>((acc, u) => {
        acc[u.id] = u
        return acc
      }, {})
      setUsersById(next)

      const mapping: Record<string, string> = {}
      const contactsForMapping = [
        ...users.filter(u => u.id !== currentUser.id),
        ...STATIC_DEMO_CONTACTS,
      ]
      const uniq = Array.from(new Map(contactsForMapping.map(c => [c.id, c])).values())
      for (const contact of uniq) {
        const chatId = await ensureDirectChat([currentUser.id, contact.id])
        mapping[contact.id] = chatId
      }
      setChatIdsByPeer(mapping)
    })
    return () => unsub()
  }, [currentUser])

  useEffect(() => {
    if (!currentUser) return
    const unsubs: Array<() => void> = []

    contacts.forEach(contact => {
      const chatId = chatIdsByPeer[contact.id]
      if (!chatId) return

      const messageUnsub = listenMessages(chatId, async dbMessages => {
        if (activeChat?.id === chatId) {
          const unreadIncoming = dbMessages.filter(m => m.senderId !== currentUser.id && m.status !== 'read' && m.id)
          await Promise.all(unreadIncoming.map(m => markMessageAsRead(chatId, m.id!)))
        }
        const messages = dbMessages.map(m => mapDbMessage(m, currentUser.id))
        const last = messages[messages.length - 1]
        const unreadCount = messages.filter(m => !m.isOutgoing && m.status !== 'read').length
        const smart = last && !last.isOutgoing
          ? await getSmartReplies(contact.displayName, last.content, messages)
          : []

        setSmartReplies(smart)
        const baseNextChat: Chat = {
          id: chatId,
          name: contact.displayName,
          avatar: (contact.displayName || 'U').slice(0, 2).toUpperCase(),
          lastMessage: last?.content || '',
          lastMessageTime: last?.timestamp || new Date(),
          unreadCount,
          isOnline: !!contact.isOnline,
          isTyping: false,
          messages,
          isMuted: false,
          isPinned: false,
          phone: contact.phone || '',
          about: contact.about || '',
          participants: [currentUser.id, contact.id],
          lastSeenAt: contact.lastSeenAt?.toDate?.() || null,
        }

        setChats(prev => {
          const existing = prev.find(c => c.id === chatId)
          const merged: Chat = existing
            ? {
                ...baseNextChat,
                isMuted: existing.isMuted,
                isPinned: existing.isPinned,
                isTyping: existing.isTyping,
                lastMessageTime: last?.timestamp || existing.lastMessageTime,
                lastMessage: last?.content || existing.lastMessage,
              }
            : baseNextChat

          if (!existing) return [merged, ...prev]
          return prev.map(c => c.id === chatId ? { ...merged, isBlocked: c.isBlocked } : c)
        })

        setActiveChatState(prev => {
          if (!prev || prev.id !== chatId) return prev
          const isBlocked = prev.isBlocked
          return { ...baseNextChat, isBlocked }
        })
      })

      const typingUnsub = listenTyping(chatId, typingBy => {
        const isTyping = Object.entries(typingBy).some(([uid, v]) => uid !== currentUser.id && v)
        updateChat(chatId, c => ({ ...c, isTyping }))
      })

      unsubs.push(messageUnsub, typingUnsub)
    })

    return () => unsubs.forEach(unsub => unsub())
  }, [activeChat?.id, chatIdsByPeer, contacts, currentUser, mapDbMessage, updateChat])

  useEffect(() => {
    if (!currentUser) return
    const onBeforeUnload = () => {
      setPresence(currentUser.id, false)
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload)
      setPresence(currentUser.id, false)
    }
  }, [currentUser])

  return (
    <ChatContext.Provider value={{
      chats,
      activeChat,
      currentUser,
      isAuthLoading,
      searchQuery,
      smartReplies,
      isAILoading,
      replyTarget,
      availableContacts,
      setSearchQuery,
      setActiveChat,
      sendMessage,
      markAsRead,
      dismissSmartReplies,
      deleteMessage,
      editMessage,
      clearMessages,
      setBlocked,
      setReplyTarget,
      setReaction,
      setTypingState,
      createOrOpenChatWithUser,
      seedDemoChats,
      loginWithGoogle,
      logout,
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