import React, { useState, useRef, useEffect } from 'react'
import {
  Smile, Paperclip, Mic, Send, X, Square, Reply,
  Image, FileText
} from 'lucide-react'
import { useChat } from '../../context/ChatContext'
import { Attachment } from '../../types'

interface Props {
  chatId: string
}

const EMOJIS = ['😀','😂','🥰','😍','🤔','😎','🥳','😅','👍','❤️','🔥','🎉','👏','🙌','💯','✅','😭','😤','🤣','😊']

export default function MessageInput({ chatId }: Props) {
  const [text, setText] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showAttach, setShowAttach] = useState(false)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const { sendMessage, activeChat, replyTarget, setReplyTarget, setTypingState } = useChat()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const documentInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isBlocked = activeChat?.id === chatId && !!activeChat.isBlocked

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [text])

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
    }
  }, [])

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.readAsDataURL(file)
    })
  }

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.readAsDataURL(blob)
    })
  }

  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new (window as any).Image()
        img.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = 100
          canvas.height = 100
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(img, 0, 0, 100, 100)
            resolve(canvas.toDataURL())
          } else {
            resolve('')
          }
        }
        img.src = e.target?.result as string
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const base64 = await fileToBase64(file)
        const thumbnail = await generateThumbnail(file)
        const newAttachment: Attachment = {
          id: `${Date.now()}-${Math.random()}`,
          name: file.name,
          type: 'image',
          mimeType: file.type,
          size: file.size,
          data: base64,
          thumbnail,
        }
        setAttachments(prev => [...prev, newAttachment])
      }
    }
    if (photoInputRef.current) photoInputRef.current.value = ''
  }

  const handleDocumentSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      const base64 = await fileToBase64(file)
      const newAttachment: Attachment = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        type: 'document',
        mimeType: file.type,
        size: file.size,
        data: base64,
      }
      setAttachments(prev => [...prev, newAttachment])
    }
    if (documentInputRef.current) documentInputRef.current.value = ''
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioChunksRef.current = []
      const mediaRecorder = new MediaRecorder(stream)
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.start()
      mediaRecorderRef.current = mediaRecorder
      setIsRecording(true)
      setRecordingTime(0)

      // Timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      alert('Unable to access microphone. Please check permissions.')
    }
  }

  const stopRecording = async () => {
    return new Promise<void>((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve()
        return
      }

      const mediaRecorder = mediaRecorderRef.current

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const base64 = await blobToBase64(audioBlob)
        
        const newAttachment: Attachment = {
          id: `${Date.now()}-${Math.random()}`,
          name: `Voice message ${new Date().toLocaleTimeString()}`,
          type: 'audio',
          mimeType: 'audio/webm',
          size: audioBlob.size,
          data: base64,
          duration: recordingTime,
        }

        setAttachments(prev => [...prev, newAttachment])
        setIsRecording(false)
        setRecordingTime(0)

        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current)
        }

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach(track => track.stop())
        mediaRecorderRef.current = null

        resolve()
      }

      mediaRecorder.stop()
    })
  }

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed && !attachments.length) return
    if (isBlocked) return
    try {
      await sendMessage(chatId, trimmed, attachments.length ? attachments : undefined)
      setText('')
      setAttachments([])
      setShowEmoji(false)
      setShowAttach(false)
      await setTypingState(chatId, false)
      textareaRef.current?.focus()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Message failed to send.'
      alert(message)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-wa-bg-light px-3 py-2 flex-shrink-0 border-t border-wa-divider">
      {isBlocked && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-sm text-red-700">
          You can’t message this contact because you blocked them.
        </div>
      )}

      {/* File inputs (hidden) */}
      <input
        ref={photoInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handlePhotoSelect}
        className="hidden"
      />
      <input
        ref={documentInputRef}
        type="file"
        multiple
        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
        onChange={handleDocumentSelect}
        className="hidden"
      />

      {/* Recording indicator */}
      {isRecording && (
        <div className="mb-2 bg-red-50 border border-red-200 rounded-lg p-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm text-red-600 font-medium">Recording {formatDuration(recordingTime)}</span>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && !isRecording && (
        <div className="bg-white rounded-xl shadow-lg p-3 mb-2 border border-wa-divider">
          <div className="grid grid-cols-10 gap-1">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setText(t => t + e)}
                className="text-xl hover:bg-wa-hover rounded-md p-1 transition-colors"
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment menu */}
      {showAttach && !isRecording && (
        <div className="flex items-center gap-3 mb-2 px-1">
          {[
            { icon: Image, label: 'Photos', color: 'bg-purple-500', action: () => photoInputRef.current?.click() },
            { icon: FileText, label: 'Document', color: 'bg-blue-500', action: () => documentInputRef.current?.click() },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <button
                onClick={item.action}
                className={`w-10 h-10 ${item.color} text-white rounded-full flex items-center justify-center shadow-sm hover:opacity-90 transition-opacity`}
              >
                <item.icon size={18} />
              </button>
              <span className="text-[10px] text-wa-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {replyTarget && (
        <div className="mb-2 bg-white rounded-lg border border-wa-divider p-2 flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-wa-teal font-medium flex items-center gap-1"><Reply size={12} /> Replying to</p>
            <p className="text-sm text-wa-text-secondary truncate">{replyTarget.content || 'Attachment'}</p>
          </div>
          <button onClick={() => setReplyTarget(null)} className="p-1 rounded hover:bg-wa-hover"><X size={14} /></button>
        </div>
      )}

      {/* File previews */}
      {attachments.length > 0 && (
        <div className="mb-2 bg-white rounded-lg border border-wa-divider p-2">
          <div className="flex flex-wrap gap-2">
            {attachments.map(att => (
              <div key={att.id} className="relative group">
                {att.type === 'image' ? (
                  <img
                    src={att.thumbnail || att.data}
                    alt={att.name}
                    className="h-20 w-20 object-cover rounded-md"
                  />
                ) : att.type === 'audio' ? (
                  <div className="h-20 w-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-md flex items-center justify-center">
                    <div className="text-center">
                      <Mic size={20} className="text-white mx-auto mb-1" />
                      <span className="text-[10px] text-white font-bold">{formatDuration(att.duration || 0)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-blue-100 rounded-md flex items-center justify-center flex-col p-2">
                    <FileText size={24} className="text-blue-600 mb-1" />
                    <span className="text-xs text-blue-600 truncate text-center">{att.name.split('.')[0]}</span>
                  </div>
                )}
                <button
                  onClick={() => removeAttachment(att.id)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
                <span className="absolute bottom-0 right-0 bg-black bg-opacity-70 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatFileSize(att.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex items-center gap-1">
          {!isRecording && !isBlocked && (
            <>
              <button
                onClick={() => { setShowEmoji(v => !v); setShowAttach(false) }}
                className={`p-2 rounded-full transition-colors ${showEmoji ? 'text-wa-teal' : 'text-wa-icon hover:text-wa-text-primary'}`}
              >
                <Smile size={22} />
              </button>
              <button
                onClick={() => { setShowAttach(v => !v); setShowEmoji(false) }}
                className={`p-2 rounded-full transition-colors ${showAttach ? 'text-wa-teal' : 'text-wa-icon hover:text-wa-text-primary'}`}
              >
                <Paperclip size={22} />
              </button>
            </>
          )}
        </div>

        <div className="flex-1 bg-white rounded-2xl flex items-end px-3 py-1.5 border border-wa-divider min-h-[42px]">
          {isRecording ? (
            <div className="flex-1 text-center text-sm text-wa-text-secondary">
              Tap stop to finish recording...
            </div>
          ) : isBlocked ? (
            <div className="flex-1 text-center text-sm text-wa-text-secondary">
              Unblock to send a message
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={text}
              onChange={async e => {
                const next = e.target.value
                setText(next)
                await setTypingState(chatId, next.trim().length > 0)
              }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message"
              rows={1}
              className="flex-1 text-[14px] text-wa-text-primary placeholder-wa-text-secondary bg-transparent resize-none outline-none leading-relaxed max-h-[120px] py-0.5"
            />
          )}
        </div>

        <button
          onClick={isRecording ? handleMicClick : handleSend}
          disabled={isBlocked}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-60 disabled:cursor-not-allowed ${
            isRecording 
              ? 'bg-red-500 text-white hover:bg-red-600 active:scale-95 shadow-sm' 
              : 'bg-wa-teal text-white hover:bg-wa-green-dark active:scale-95 shadow-sm'
          }`}
        >
          {isRecording ? (
            <Square size={18} />
          ) : text.trim() || attachments.length ? (
            <Send size={18} />
          ) : (
            <Mic size={18} onClick={handleMicClick} />
          )}
        </button>
      </div>
    </div>
  )
}
