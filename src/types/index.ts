export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Attachment {
  id: string
  name: string
  type: 'image' | 'document' | 'file' | 'audio'
  mimeType: string
  size: number
  data?: string // local preview (base64)
  url?: string // remote url from Firebase Storage
  path?: string // storage path
  thumbnail?: string
  duration?: number // duration in seconds for audio
}

export interface Message {
  id: string
  content: string
  timestamp: Date
  isOutgoing: boolean
  status: MessageStatus
  type: 'text' | 'image' | 'emoji' | 'file' | 'audio'
  attachments?: Attachment[]
  senderId?: string
  replyToMessageId?: string
  replyToSnippet?: string
  reactions?: Record<string, string>
  deleted?: boolean
  isEditing?: boolean
  editedAt?: Date
}

export interface Chat {
  id: string
  name: string
  avatar: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
  isOnline: boolean
  isTyping: boolean
  messages: Message[]
  isMuted: boolean
  isPinned: boolean
  phone: string
  about: string
  isBlocked?: boolean
  lastSeenAt?: Date | null
  participants?: string[]
}

export interface User {
  id: string
  name: string
  avatar: string
  phone: string
  about: string
  email?: string
  isOnline?: boolean
  lastSeenAt?: Date | null
  theme?: 'light' | 'dark'
}