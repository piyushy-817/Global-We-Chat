import { Lock } from 'lucide-react'

export default function Welcome() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-wa-bg-light gap-4">
      <div className="flex flex-col items-center gap-4 max-w-sm text-center">
        <div className="w-52 h-52 mb-2">
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="90" fill="#25D366" opacity="0.1"/>
            <path
              d="M100 30C62 30 30 62 30 100c0 12.5 3.4 24.3 9.3 34.4L30 170l36.5-9.5C76.5 166 88 170 100 170c38 0 70-32 70-70S138 30 100 30z"
              fill="#25D366"
              opacity="0.8"
            />
            <path
              d="M78 88c0-2.2 1.8-4 4-4h36c2.2 0 4 1.8 4 4s-1.8 4-4 4H82c-2.2 0-4-1.8-4-4zM78 104c0-2.2 1.8-4 4-4h24c2.2 0 4 1.8 4 4s-1.8 4-4 4H82c-2.2 0-4-1.8-4-4z"
              fill="white"
              opacity="0.9"
            />
          </svg>
        </div>

        <h2 className="text-[22px] font-light text-wa-text-primary">WhatsApp Web</h2>
        <p className="text-[14px] text-wa-text-secondary leading-relaxed">
          Send and receive messages without keeping your phone online.
          Use WhatsApp on up to 4 linked devices and 1 phone at the same time.
        </p>

        <div className="flex items-center gap-2 mt-4 border-t border-wa-divider w-full pt-4 justify-center">
          <Lock size={13} className="text-wa-text-secondary" />
          <p className="text-[12px] text-wa-text-secondary">
            Your personal messages are end-to-end encrypted
          </p>
        </div>
      </div>
    </div>
  )
}