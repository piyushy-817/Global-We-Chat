export type MessageStatus = 'sent' | 'delivered' | 'read'

export interface Attachment {
  id: string
  name: string
  type: 'image' | 'document' | 'file' | 'audio'
  mimeType: string
  size: number
  data: string // base64 encoded
  thumbnail?: string // base64 encoded thumbnail for images
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
}

export interface User {
  id: string
  name: string
  avatar: string
  phone: string
  about: string
}