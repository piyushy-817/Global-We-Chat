import { useEffect, useRef, useState } from 'react'
import { MoreVertical, Phone, Search, Video, ArrowLeft, BellOff, Trash2, Ban, ChevronUp, ChevronDown } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Avatar from '../shared/Avatar'
import { Chat } from '../../types'

interface Props {
  chat: Chat
  onClearMessages?: () => void
  onBlockChange?: (blocked: boolean) => void
  onSearch?: (query: string) => void
  onSearchNext?: () => void
  onSearchPrev?: () => void
  searchResultIndex?: number
  searchResultTotal?: number
}

export default function ChatHeader({
  chat,
  onClearMessages,
  onBlockChange,
  onSearch,
  onSearchNext,
  onSearchPrev,
  searchResultIndex = 0,
  searchResultTotal = 0,
}: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showBlockConfirm, setShowBlockConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isBlocked = !!chat.isBlocked

  useEffect(() => {
    const onDown = (event: MouseEvent) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [showMenu])

  return (
    <div className="flex items-center justify-between px-4 bg-wa-bg-light h-[60px] border-b border-wa-divider flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button className="md:hidden p-1 text-wa-icon">
          <ArrowLeft size={20} />
        </button>
        <Avatar initials={chat.avatar} size="md" isOnline={chat.isOnline} />
        <div className="min-w-0 flex-1">
          {showSearch ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  onSearch?.(e.target.value)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (e.shiftKey) {
                      onSearchPrev?.()
                    } else {
                      if (searchQuery.trim()) {
                        onSearchNext?.()
                      } else {
                        onSearch?.(searchQuery)
                      }
                    }
                  } else if (e.key === 'Escape') {
                    setShowSearch(false)
                    setSearchQuery('')
                    onSearch?.('')
                  }
                }}
                className="flex-1 px-3 py-1 text-[14px] bg-white rounded-full border border-wa-divider focus:outline-none focus:border-wa-teal"
                autoFocus
              />

              {searchQuery.trim() && (
                <div className="flex items-center gap-1">
                  <span className="text-[12px] text-wa-text-secondary min-w-[44px] text-right">
                    {searchResultTotal ? `${searchResultIndex}/${searchResultTotal}` : '0/0'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onSearchPrev?.()}
                    disabled={!searchResultTotal}
                    className="p-1 text-wa-icon hover:text-wa-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Previous match"
                  >
                    <ChevronUp size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSearchNext?.()}
                    disabled={!searchResultTotal}
                    className="p-1 text-wa-icon hover:text-wa-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Next match"
                  >
                    <ChevronDown size={18} />
                  </button>
                </div>
              )}
              <button
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery('')
                  onSearch?.('')
                }}
                className="p-1 text-wa-icon hover:text-wa-text-primary"
              >
                ✕
              </button>
            </div>
          ) : (
            <>
              <p className="font-medium text-[15px] text-wa-text-primary truncate">{chat.name}</p>
              <p className="text-[12px] text-wa-text-secondary truncate">
                {isBlocked
                  ? 'You have blocked this user'
                  : chat.isTyping
                  ? <span className="text-wa-green">{`${chat.name} is typing...`}</span>
                  : chat.isOnline
                  ? 'online'
                  : chat.lastSeenAt
                  ? `last seen ${formatDistanceToNow(chat.lastSeenAt, { addSuffix: true })}`
                  : 'offline'
                }
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors">
          <Video size={20} />
        </button>
        <button className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors">
          <Phone size={20} />
        </button>
        <button 
          onClick={() => {
            setShowSearch(v => {
              const next = !v
              if (!next) {
                setSearchQuery('')
                onSearch?.('')
              }
              return next
            })
          }}
          className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors"
        >
          <Search size={20} />
        </button>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(v => !v)}
            className="p-2 rounded-full hover:bg-wa-hover text-wa-icon transition-colors"
          >
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-10 w-48 bg-white shadow-lg rounded-md py-1 z-50 border border-wa-divider">
              {[
                { icon: BellOff, label: isMuted ? 'Unmute notifications' : 'Mute notifications', action: () => setIsMuted(v => !v) },
                { icon: Trash2, label: 'Delete chat', action: () => setShowClearConfirm(true) },
                { icon: Ban, label: isBlocked ? 'Unblock' : 'Block', action: () => setShowBlockConfirm(true) },
              ].map(item => (
                <button
                  key={item.label}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] text-wa-text-primary hover:bg-wa-hover transition-colors"
                  onClick={() => {
                    item.action()
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

      {showClearConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowClearConfirm(false)}
        >
          <div
            className="bg-white rounded-lg p-4 mx-4 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete this chat?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will remove all messages in this chat.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onClearMessages?.()
                  setShowClearConfirm(false)
                }}
                className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showBlockConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowBlockConfirm(false)}
        >
          <div
            className="bg-white rounded-lg p-4 mx-4 max-w-sm w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {isBlocked ? `Unblock ${chat.name}?` : `Block ${chat.name}?`}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {isBlocked
                ? 'You will be able to send messages again.'
                : 'You won’t receive messages or calls from this contact.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowBlockConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onBlockChange?.(!isBlocked)
                  setShowBlockConfirm(false)
                }}
                className={`px-4 py-2 text-sm text-white rounded transition-colors ${
                  isBlocked ? 'bg-wa-teal hover:bg-wa-green-dark' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}