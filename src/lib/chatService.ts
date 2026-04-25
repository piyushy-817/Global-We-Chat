import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from './firebase'
import { Attachment, Message, MessageStatus, User } from '../types'

const MAX_FIRESTORE_ATTACHMENT_BYTES = 700 * 1024

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(item => stripUndefinedDeep(item)) as T
  }
  if (value && typeof value === 'object') {
    const cleaned = Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, v]) => {
      if (v !== undefined) {
        acc[key] = stripUndefinedDeep(v)
      }
      return acc
    }, {})
    return cleaned as T
  }
  return value
}

export interface DBUser {
  id: string
  displayName: string
  photoURL?: string
  email?: string
  about?: string
  phone?: string
  isOnline?: boolean
  lastSeenAt?: Timestamp | null
}

export interface DBMessage {
  id?: string
  senderId: string
  content: string
  timestamp: Timestamp | null
  status: MessageStatus
  type: Message['type']
  attachments?: Attachment[]
  deleted?: boolean
  editedAt?: Timestamp
  replyToMessageId?: string
  replyToSnippet?: string
  reactions?: Record<string, string>
}

export function listenUsers(cb: (users: DBUser[]) => void) {
  return onSnapshot(collection(db, 'users'), snap => {
    cb(
      snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<DBUser, 'id'>),
      }))
    )
  })
}

export function listenMessages(chatId: string, cb: (messages: DBMessage[]) => void) {
  const messagesRef = collection(db, 'chats', chatId, 'messages')
  return onSnapshot(query(messagesRef, orderBy('timestamp', 'asc')), snap => {
    cb(
      snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<DBMessage, 'id'>),
      }))
    )
  })
}

export async function upsertUser(user: User) {
  await setDoc(
    doc(db, 'users', user.id),
    {
      displayName: user.name,
      photoURL: user.avatar,
      email: user.email ?? '',
      about: user.about ?? '',
      phone: user.phone ?? '',
      isOnline: true,
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function ensureBotUser(botUserId: string) {
  await setDoc(
    doc(db, 'users', botUserId),
    {
      displayName: 'Groq AI Bot',
      photoURL: 'AI',
      about: 'Auto-replies in real time',
      isOnline: true,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function setPresence(userId: string, isOnline: boolean) {
  await setDoc(
    doc(db, 'users', userId),
    {
      isOnline,
      lastSeenAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}

export async function ensureDirectChat(participants: string[]): Promise<string> {
  const sorted = [...participants].sort()
  const chatKey = sorted.join('_')
  const q = query(collection(db, 'chats'), where('chatKey', '==', chatKey))
  const snap = await getDocs(q)
  if (!snap.empty) {
    return snap.docs[0].id
  }

  const created = await addDoc(collection(db, 'chats'), {
    participants: sorted,
    chatKey,
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    typingBy: {},
  })
  return created.id
}

export async function sendFirestoreMessage(chatId: string, message: Omit<DBMessage, 'timestamp'>) {
  const cleanMessage = stripUndefinedDeep(message)

  await setDoc(
    doc(db, 'chats', chatId),
    {
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      typingBy: {},
    },
    { merge: true }
  )
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    ...cleanMessage,
    timestamp: serverTimestamp(),
  })
  await setDoc(doc(db, 'chats', chatId), { updatedAt: serverTimestamp() }, { merge: true })
}

export async function updateTyping(chatId: string, userId: string, typing: boolean) {
  await updateDoc(doc(db, 'chats', chatId), {
    [`typingBy.${userId}`]: typing,
    updatedAt: serverTimestamp(),
  })
}

export function listenTyping(chatId: string, cb: (typingBy: Record<string, boolean>) => void) {
  return onSnapshot(doc(db, 'chats', chatId), snap => {
    const data = snap.data() as { typingBy?: Record<string, boolean> } | undefined
    cb(data?.typingBy ?? {})
  })
}

export async function uploadAttachment(userId: string, attachment: Attachment): Promise<Attachment> {
  void userId
  // Spark-friendly fallback: keep attachment inline in Firestore message payload.
  // Guard size to avoid Firestore 1MiB document limit issues.
  if (attachment.size > MAX_FIRESTORE_ATTACHMENT_BYTES) {
    throw new Error(
      `Attachment "${attachment.name}" is too large for Spark mode. Keep files under ${Math.round(
        MAX_FIRESTORE_ATTACHMENT_BYTES / 1024
      )} KB or upgrade storage approach.`
    )
  }

  return {
    ...attachment,
    url: attachment.url || attachment.data,
    path: undefined,
  }
}

export async function softDeleteMessage(chatId: string, messageId: string) {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
    deleted: true,
    content: '',
    editedAt: serverTimestamp(),
  })
}

export async function editMessage(chatId: string, messageId: string, content: string) {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
    content,
    editedAt: serverTimestamp(),
  })
}

export async function reactToMessage(chatId: string, messageId: string, userId: string, emoji: string) {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
    [`reactions.${userId}`]: emoji,
    editedAt: serverTimestamp(),
  })
}

export async function markMessageAsRead(chatId: string, messageId: string) {
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), {
    status: 'read',
    editedAt: serverTimestamp(),
  })
}

export async function clearChatMessages(chatId: string) {
  const messagesRef = collection(db, 'chats', chatId, 'messages')
  return new Promise<void>((resolve) => {
    const unsub = onSnapshot(messagesRef, async snap => {
      unsub()
      await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
      resolve()
    })
  })
}

