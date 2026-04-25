import { ChatProvider } from './context/ChatContext'
import Sidebar from './components/Sidebar/Sidebar'
import ChatWindow from './components/ChatWindow/ChatWindow'
import Welcome from './components/Welcome/Welcome'
import { useChat } from './context/ChatContext'

function AppContent() {
  const { activeChat, currentUser, isAuthLoading, loginWithGoogle } = useChat()

  if (isAuthLoading) {
    return <div className="h-screen w-screen grid place-items-center bg-wa-bg-light text-wa-text-secondary">Loading...</div>
  }

  if (!currentUser) {
    return (
      <div className="h-screen w-screen grid place-items-center bg-wa-bg-light px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center border border-wa-divider">
          <h1 className="text-xl font-semibold text-wa-text-primary mb-2">Sign in to Global We Chat</h1>
          <p className="text-sm text-wa-text-secondary mb-5">Use Firebase Authentication to start chatting with real users.</p>
          <button
            onClick={loginWithGoogle}
            className="w-full py-2.5 rounded-lg bg-wa-teal text-white hover:bg-wa-green-dark transition-colors"
          >
            Continue with Google
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-wa-bg-light">
      <Sidebar />
      {activeChat ? <ChatWindow /> : <Welcome />}
    </div>
  )
}

export default function App() {
  return (
    <ChatProvider>
      <AppContent />
    </ChatProvider>
  )
}