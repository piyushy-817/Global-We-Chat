
import { getAvatarColor } from '../../utils/helpers'

interface AvatarProps {
  initials: string
  size?: 'sm' | 'md' | 'lg'
  isOnline?: boolean
}

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
}

export default function Avatar({ initials, size = 'md', isOnline }: AvatarProps) {
  const colorClass = getAvatarColor(initials)

  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeMap[size]} ${colorClass} rounded-full flex items-center justify-center font-medium text-white select-none`}>
        {initials.slice(0, 2).toUpperCase()}
      </div>
      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-wa-green rounded-full border-2 border-white" />
      )}
    </div>
  )
}