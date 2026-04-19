
import { format, isToday, isYesterday, isThisWeek } from 'date-fns'

export function formatChatTime(date: Date): string {
  if (isToday(date)) return format(date, 'HH:mm')
  if (isYesterday(date)) return 'Yesterday'
  if (isThisWeek(date)) return format(date, 'EEEE')
  return format(date, 'dd/MM/yyyy')
}

export function formatMessageTime(date: Date): string {
  return format(date, 'HH:mm')
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getAvatarColor(name: string): string {
  const colors = [
    'bg-[#FF6B6B]', 'bg-[#4ECDC4]', 'bg-[#45B7D1]', 'bg-[#96CEB4]',
    'bg-[#FECA57]', 'bg-[#FF9FF3]', 'bg-[#54A0FF]', 'bg-[#5F27CD]',
    'bg-[#00D2D3]', 'bg-[#FF9F43]', 'bg-[#EE5A24]', 'bg-[#009432]',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}