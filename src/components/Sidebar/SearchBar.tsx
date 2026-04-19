
import { Search, X } from 'lucide-react'
import { useChat } from '../../context/ChatContext'

export default function SearchBar() {
  const { searchQuery, setSearchQuery } = useChat()

  return (
    <div className="px-3 py-2 bg-wa-bg-light">
      <div className="flex items-center bg-white rounded-lg px-3 gap-2 h-9">
        <Search size={15} className="text-wa-icon flex-shrink-0" />
        <input
          type="text"
          placeholder="Search or start new chat"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="flex-1 text-[13px] text-wa-text-primary placeholder-wa-text-secondary bg-transparent border-none outline-none"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="text-wa-icon hover:text-wa-text-primary">
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  )
}