import { useState } from 'react'
import {
  MessageCircle, MoreVertical, Plus, Users,
  Settings, Archive, Star, Moon, Sun, LogOut, UserPlus, Sparkles
} from 'lucide-react'
import SearchBar from './SearchBar'
import ChatListItem from './ChatListItem'
import Avatar from '../shared/Avatar'
import { useChat } from '../../context/ChatContext'

export default function Sidebar() {
  const { chats, activeChat, searchQuery, currentUser, logout, availableContacts, createOrOpenChatWithUser, seedDemoChats } = useChat()
  const [showMenu, setShowMenu] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark')

  const filtered = chats.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const pinned = filtered.filter(c => c.isPinned)
  const rest = filtered.filter(c => !c.isPinned)

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className="w-[380px] flex-shrink-0 flex flex-col border-r border-wa-divider bg-wa-panel h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-wa-bg-light h-[60px]">
        <Avatar initials={currentUser?.avatar || 'ME'} size="md" />
        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors">
            <Users size={20} />
          </button>
          <button onClick={() => setShowNewChat(true)} className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors">
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
                  { icon: isDark ? Sun : Moon, label: isDark ? 'Light mode' : 'Dark mode', action: toggleTheme },
                  { icon: Settings, label: 'Settings' },
                  { icon: LogOut, label: 'Logout', action: logout },
                ].map(item => (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] text-wa-text-primary hover:bg-wa-hover transition-colors"
                    onClick={() => {
                      ;(item as any).action?.()
                      setShowMenu(false)
                    }}
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
          <div className="flex flex-col items-center justify-center h-48 gap-3 px-5 text-center">
            <MessageCircle size={32} className="text-wa-text-secondary opacity-40" />
            <p className="text-[13px] text-wa-text-secondary">No chats found</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewChat(true)}
                className="text-xs px-3 py-1.5 rounded-full border border-wa-divider hover:bg-wa-hover flex items-center gap-1"
              >
                <UserPlus size={13} />
                Start chat
              </button>
              <button
                onClick={seedDemoChats}
                className="text-xs px-3 py-1.5 rounded-full bg-wa-teal text-white hover:bg-wa-green-dark flex items-center gap-1"
              >
                <Sparkles size={13} />
                Add demo chats
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <div className="absolute bottom-6 left-[305px]">
        <button onClick={() => setShowNewChat(true)} className="w-12 h-12 rounded-full bg-wa-teal text-white flex items-center justify-center shadow-md hover:bg-wa-green-dark transition-colors">
          <Plus size={22} />
        </button>
      </div>

      {showNewChat && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" onClick={() => setShowNewChat(false)}>
          <div className="bg-white rounded-xl w-full max-w-md mx-4 p-4 border border-wa-divider shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-wa-text-primary mb-1">Start a new conversation</h3>
            <p className="text-xs text-wa-text-secondary mb-3">Pick a user to open a direct chat.</p>

            <div className="max-h-72 overflow-y-auto border border-wa-divider rounded-lg">
              {availableContacts.length === 0 ? (
                <div className="p-4 text-sm text-wa-text-secondary text-center">
                  No users found. Add demo chats to seed sample users.
                </div>
              ) : (
                availableContacts.map(contact => (
                  <button
                    key={contact.id}
                    onClick={async () => {
                      try {
                        await createOrOpenChatWithUser(contact.id)
                        setShowNewChat(false)
                      } catch (error) {
                        const message = error instanceof Error ? error.message : 'Unable to start chat.'
                        alert(message)
                      }
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-wa-hover border-b border-wa-divider last:border-b-0"
                  >
                    <p className="text-sm font-medium text-wa-text-primary">{contact.name}</p>
                    <p className="text-xs text-wa-text-secondary truncate">{contact.about || (contact.isOnline ? 'online' : 'offline')}</p>
                  </button>
                ))
              )}
            </div>

            <div className="flex justify-between items-center mt-3">
              <button
                onClick={seedDemoChats}
                className="text-xs px-3 py-1.5 rounded-full bg-wa-teal text-white hover:bg-wa-green-dark flex items-center gap-1"
              >
                <Sparkles size={13} />
                Add demo chats
              </button>
              <button onClick={() => setShowNewChat(false)} className="text-sm px-3 py-1.5 rounded hover:bg-wa-hover">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}