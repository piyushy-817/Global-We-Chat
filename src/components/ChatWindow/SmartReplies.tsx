import { X, Zap } from 'lucide-react'
import { useChat } from '../../context/ChatContext'

interface Props {
  chatId: string
}

export default function SmartReplies({ chatId }: Props) {
  const { smartReplies, sendMessage, dismissSmartReplies, isAILoading } = useChat()

  if (isAILoading) {
    return (
      <div className="px-4 py-2 bg-white border-t border-wa-divider flex items-center gap-2">
        <Zap size={13} className="text-wa-green animate-pulse flex-shrink-0" />
        <div className="flex gap-2">
          {[80, 60, 72].map((w, i) => (
            <div
              key={i}
              className="h-7 rounded-full bg-wa-divider animate-pulse"
              style={{ width: `${w}px` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!smartReplies.length) return null

  return (
    <div className="px-3 py-2 bg-white border-t border-wa-divider flex items-center gap-2 overflow-x-auto no-scrollbar">
      <Zap size={13} className="text-wa-green flex-shrink-0" />
      <div className="flex items-center gap-2 flex-1 overflow-x-auto">
        {smartReplies.map((reply, i) => (
          <button
            key={i}
            onClick={() => {
              sendMessage(chatId, reply)
            }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full border border-wa-green text-wa-green text-[12px] font-medium hover:bg-wa-green hover:text-white transition-all duration-150 active:scale-95 whitespace-nowrap"
          >
            {reply}
          </button>
        ))}
      </div>
      <button
        onClick={dismissSmartReplies}
        className="flex-shrink-0 p-1 rounded-full hover:bg-wa-hover text-wa-text-secondary transition-colors"
      >
        <X size={13} />
      </button>
    </div>
  )
}