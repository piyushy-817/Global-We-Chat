
import { BellOff, Pin, Check, CheckCheck } from 'lucide-react'
import { Chat } from '../../types'
import { formatChatTime } from '../../utils/helpers'
import Avatar from '../shared/Avatar'
import { useChat } from '../../context/ChatContext'

interface Props {
  chat: Chat
  isActive: boolean
}

function MessageStatus({ status }: { status: string }) {
  if (status === 'read') return <CheckCheck size={14} className="text-[#53BDEB] flex-shrink-0" />
  if (status === 'delivered') return <CheckCheck size={14} className="text-wa-text-secondary flex-shrink-0" />
  return <Check size={14} className="text-wa-text-secondary flex-shrink-0" />
}

export default function ChatListItem({ chat, isActive }: Props) {
  const { setActiveChat } = useChat()
  const lastMsg = chat.messages[chat.messages.length - 1]

  return (
    <div
      onClick={() => setActiveChat(chat)}
      className={`flex items-center gap-3 px-3 py-3 cursor-pointer hover:bg-wa-hover transition-colors ${isActive ? 'bg-wa-active' : ''}`}
    >
      <Avatar initials={chat.avatar} size="md" isOnline={chat.isOnline} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-1 min-w-0">
            {chat.isPinned && <Pin size={11} className="text-wa-text-secondary flex-shrink-0" />}
            <span className="font-medium text-[15px] text-wa-text-primary truncate">{chat.name}</span>
          </div>
          <span className={`text-[11px] flex-shrink-0 ml-1 ${chat.unreadCount > 0 ? 'text-wa-green' : 'text-wa-text-secondary'}`}>
            {formatChatTime(chat.lastMessageTime)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 min-w-0 flex-1">
            {lastMsg?.isOutgoing && !chat.isTyping && (
              <div className="flex-shrink-0">
                <MessageStatus status={lastMsg.status} />
              </div>
            )}
            {chat.isTyping ? (
              <span className="text-[13px] text-wa-green truncate">typing...</span>
            ) : (
              <span className="text-[13px] text-wa-text-secondary truncate">{chat.lastMessage}</span>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {chat.isMuted && <BellOff size={13} className="text-wa-text-secondary" />}
            {chat.unreadCount > 0 && (
              <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${chat.isMuted ? 'bg-wa-text-secondary text-white' : 'bg-wa-green text-white'}`}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}