import React, { useState, useRef, useEffect } from 'react'
import { Check, CheckCheck, Download, FileText, MoreVertical, Trash2, Edit, Play, Pause } from 'lucide-react'
import { Message } from '../../types'
import { formatMessageTime } from '../../utils/helpers'

interface Props {
  message: Message
  highlightQuery?: string
  isHighlighted?: boolean
  showDateDivider?: boolean
  dividerLabel?: string
  onDelete?: (messageId: string) => void
  onEdit?: (messageId: string, newContent: string) => void
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>

  const re = new RegExp(`(${escapeRegExp(q)})`, 'ig')
  const parts = text.split(re)
  return (
    <>
      {parts.map((part, idx) => {
        const isMatch = part.toLowerCase() === q.toLowerCase()
        return isMatch ? (
          <mark
            key={idx}
            className="bg-yellow-200 text-wa-text-primary rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <React.Fragment key={idx}>{part}</React.Fragment>
        )
      })}
    </>
  )
}

function TickIcon({ status }: { status: string }) {
  if (status === 'read') return <CheckCheck size={13} className="text-[#53BDEB]" />
  if (status === 'delivered') return <CheckCheck size={13} className="text-white/70" />
  return <Check size={13} className="text-white/70" />
}

export default function MessageBubble({ message, highlightQuery, isHighlighted, showDateDivider, dividerLabel, onDelete, onEdit }: Props) {
  const [showMenu, setShowMenu] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(message.content)
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null)
  const [audioProgress, setAudioProgress] = useState<Record<string, number>>({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const editInputRef = useRef<HTMLTextAreaElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const confirmRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
      if (showDeleteConfirm && confirmRef.current && !confirmRef.current.contains(event.target as Node)) {
        setShowDeleteConfirm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu, showDeleteConfirm])

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus()
      editInputRef.current.select()
    }
  }, [isEditing])

  const downloadFile = (data: string, name: string) => {
    const link = document.createElement('a')
    link.href = data
    link.download = name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDuration = (seconds?: number): string => {
    if (!seconds) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayAudio = (audioData: string, audioId: string) => {
    if (playingAudioId === audioId) {
      // Pause
      if (audioRef.current) {
        audioRef.current.pause()
      }
      setPlayingAudioId(null)
    } else {
      // Play
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(audioData)
      audio.onplay = () => setPlayingAudioId(audioId)
      audio.onpause = () => setPlayingAudioId(null)
      audio.onended = () => setPlayingAudioId(null)
      audio.ontimeupdate = () => {
        setAudioProgress(prev => ({
          ...prev,
          [audioId]: audio.currentTime
        }))
      }
      audio.play()
      ;(audioRef as any).current = audio
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setShowMenu(false)
  }

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit?.(message.id, editText.trim())
      setIsEditing(false)
    }
  }

  const handleCancelEdit = () => {
    setEditText(message.content)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <>
      {showDateDivider && (
        <div className="flex items-center justify-center my-4">
          <span className="bg-[#E1F3FB] text-[#54656F] text-[12px] px-3 py-1 rounded-full shadow-sm">
            {dividerLabel}
          </span>
        </div>
      )}

      <div
        data-message-id={message.id}
        className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'} mb-1 slide-in relative`}
      >
        <div
          className={`max-w-[65%] shadow-sm relative group transition-all ${
            message.isOutgoing
              ? 'bg-wa-bubble-out message-out pt-8'
              : 'bg-wa-bubble-in message-in'
          } ${isHighlighted ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-transparent' : ''}`}
          style={{ minWidth: '80px' }}
        >
          {/* Deleted message state */}
          {message.deleted ? (
            <div className="px-3 py-2">
              <p className="text-[13px] text-wa-text-secondary italic flex items-center gap-1">
                <span>This message was deleted</span>
              </p>
              <div className={`flex items-center gap-0.5 mt-1 ${message.isOutgoing ? '' : ''}`}>
                <span className="text-[10px] text-wa-text-secondary leading-none">
                  {formatMessageTime(message.timestamp)}
                </span>
                {message.isOutgoing && (
                  <TickIcon status={message.status} />
                )}
              </div>
            </div>
          ) : isEditing ? (
            // Edit mode
            <div className="px-3 py-2">
              <textarea
                ref={editInputRef}
                value={editText}
                onChange={e => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full text-[14px] text-wa-text-primary bg-white/20 rounded px-2 py-1 resize-none outline-none border border-white/40 focus:border-wa-teal"
                rows={Math.min(Math.max(1, editText.split('\n').length), 4)}
              />
              <div className="flex gap-2 mt-2 justify-end">
                <button
                  onClick={handleCancelEdit}
                  className="text-xs px-2 py-1 rounded hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="text-xs px-2 py-1 bg-wa-teal text-white rounded hover:bg-wa-green-dark transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mb-2 pt-2 px-3">
                  <div className="flex flex-wrap gap-2">
                    {message.attachments.map(att => (
                      <div key={att.id} className="relative group">
                        {att.type === 'image' ? (
                          <div className="relative">
                            <img
                              src={att.thumbnail || att.data}
                              alt={att.name}
                              className="h-32 w-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(att.data)}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <Download size={20} className="text-white" />
                            </div>
                          </div>
                        ) : att.type === 'audio' ? (
                          <div className={`p-3 rounded-lg flex items-center gap-2 ${
                            message.isOutgoing
                              ? 'bg-white/20 hover:bg-white/30'
                              : 'bg-black/5 hover:bg-black/10'
                          }`}>
                            <button
                              onClick={() => handlePlayAudio(att.data, att.id)}
                              className="flex-shrink-0 p-1.5 rounded-full bg-wa-teal text-white hover:opacity-90 transition-opacity"
                            >
                              {playingAudioId === att.id ? (
                                <Pause size={16} />
                              ) : (
                                <Play size={16} />
                              )}
                            </button>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-semibold">Voice message</span>
                              <div className="flex items-center gap-1">
                                <div className="w-20 bg-white/30 rounded-full h-1 relative">
                                  <div
                                    className="bg-wa-teal h-1 rounded-full transition-all"
                                    style={{
                                      width: `${((audioProgress[att.id] || 0) / (att.duration || 1)) * 100}%`
                                    }}
                                  />
                                </div>
                                <span className="text-[10px] whitespace-nowrap">{formatDuration(att.duration)}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => downloadFile(att.data, att.name)}
                            className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
                              message.isOutgoing
                                ? 'bg-white/20 hover:bg-white/30'
                                : 'bg-black/5 hover:bg-black/10'
                            }`}
                          >
                            <FileText size={20} className="flex-shrink-0" />
                            <div className="flex flex-col items-start max-w-[120px]">
                              <span className="text-xs font-semibold truncate">{att.name}</span>
                              <span className="text-xs opacity-70">{formatFileSize(att.size)}</span>
                            </div>
                            <Download size={16} className="flex-shrink-0 opacity-70" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Text content */}
              {message.content && !message.content.startsWith('📎') && (
                <div className={`px-3 py-1.5 flex items-start gap-2`}>
                  <p className="text-[14px] text-wa-text-primary leading-relaxed break-words flex-1">
                    <HighlightedText text={message.content} query={highlightQuery || ''} />
                  </p>
                </div>
              )}

              {/* 3-dot menu for outgoing messages */}
              {message.isOutgoing && (
                <div className="absolute top-2 right-2" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
                    title="More options"
                  >
                    <MoreVertical size={16} className="opacity-70 hover:opacity-100" />
                  </button>

                  {/* Context menu */}
                  {showMenu && (
                    <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border border-wa-divider z-10 min-w-[140px] overflow-hidden">
                      {message.content && (
                        <button
                          onClick={() => {
                            handleEdit()
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-wa-hover text-wa-text-primary text-sm transition-colors text-left"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true)
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600 text-sm transition-colors text-left"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Delete confirmation popup */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDeleteConfirm(false)}>
                  <div ref={confirmRef} className="bg-white rounded-lg p-4 mx-4 max-w-sm w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete message?</h3>
                    <p className="text-sm text-gray-600 mb-4">This action cannot be undone.</p>
                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          onDelete?.(message.id)
                          setShowDeleteConfirm(false)
                        }}
                        className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Time and status */}
              <div className={`flex items-center gap-0.5 px-3 pb-1.5 ${message.isOutgoing ? '' : ''}`}>
                <span className="text-[10px] text-wa-text-secondary leading-none">
                  {formatMessageTime(message.timestamp)}
                  {message.editedAt && <span className="ml-1 text-[9px]">(edited)</span>}
                </span>
                {message.isOutgoing && (
                  <TickIcon status={message.status} />
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}