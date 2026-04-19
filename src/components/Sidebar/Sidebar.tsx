import { useState } from 'react'
import {
  MessageCircle, MoreVertical, Plus, Users,
  Settings, Archive, Star, Moon
} from 'lucide-react'
import SearchBar from './SearchBar'
import ChatListItem from './ChatListItem'
import Avatar from '../shared/Avatar'
import { useChat } from '../../context/ChatContext'
import { currentUser } from '../../data/mockData'

export default function Sidebar() {
  const { chats, activeChat, searchQuery } = useChat()
  const [showMenu, setShowMenu] = useState(false)

  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinned = filtered.filter(c => c.isPinned)
  const rest = filtered.filter(c => !c.isPinned)

  return (
    <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-wa-divider bg-wa-panel h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-wa-bg-light h-[60px]">
        <Avatar initials={currentUser.avatar} size="md" />
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors">
            <Users size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors">
            <MessageCircle size={20} />
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu(v => !v)}
              className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors"
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-10 w-48 bg-white shadow-lg rounded-md py-1 z-50 border border-wa-divider">
                {[
                  { icon: Users, label: 'New group' },
                  { icon: Archive, label: 'Archived' },
                  { icon: Star, label: 'Starred messages' },
                  { icon: Moon, label: 'Do not disturb' },
                  { icon: Settings, label: 'Settings' },
                ].map(item => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] text-wa-text-primary hover:bg-wa-hover transition-colors"
                    onClick={() => setShowMenu(false)}
                  >
                    <item.icon size={16} className="text-wa-icon" />
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <SearchBar />

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {pinned.length > 0 && (
          <>
            {pinned.map(chat => (
              <ChatListItem key={chat.id} chat={chat} isActive={activeChat?.id === chat.id} />
            ))}
            {rest.length > 0 && (
              <div className="px-4 py-1.5 bg-wa-bg-light">
                <span className="text-[11px] text-wa-text-secondary font-medium uppercase tracking-wide">All chats</span>
              </div>
            )}
          </>
        )}
        {rest.map(chat => (
          <ChatListItem key={chat.id} chat={chat} isActive={activeChat?.id === chat.id} />
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <MessageCircle size={32} className="text-wa-text-secondary opacity-40" />
            <p className="text-[13px] text-wa-text-secondary">No chats found</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="absolute bottom-6 left-[305px]">
        <button className="w-12 h-12 rounded-full bg-wa-teal text-white flex items-center justify-center shadow-md hover:bg-wa-green-dark transition-colors">
          <Plus size={22} />
        </button>
      </div>
    </div>
  )
}