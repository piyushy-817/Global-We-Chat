import { ChatProvider } from './context/ChatContext'
import Sidebar from './components/Sidebar/Sidebar'
import ChatWindow from './components/ChatWindow/ChatWindow'
import Welcome from './components/Welcome/Welcome'
import { useChat } from './context/ChatContext'

function AppContent() {
  const { activeChat } = useChat()

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