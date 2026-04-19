import { Chat, User } from '../types'

export const currentUser: User = {
  id: 'me',
  name: 'You',
  avatar: 'YO',
  phone: '+91 98765 43210',
  about: 'Available',
}

const now = new Date()
const mins = (n: number) => new Date(now.getTime() - n * 60 * 1000)
const hours = (n: number) => new Date(now.getTime() - n * 60 * 60 * 1000)
const days = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000)

export const mockChats: Chat[] = [
  {
    id: '1',
    name: 'Riya Sharma',
    avatar: 'RS',
    lastMessage: 'Haan bata, kya plan hai weekend ke liye?',
    lastMessageTime: mins(2),
    unreadCount: 3,
    isOnline: true,
    isTyping: false,
    isMuted: false,
    isPinned: true,
    phone: '+91 98765 12345',
    about: 'Living life one chai at a time ☕',
    messages: [
      { id: 'm1', content: 'Hey! Kaise ho?', timestamp: hours(2), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm2', content: 'Main theek hoon, tum batao!', timestamp: hours(2), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm3', content: 'Aaj kuch plan hai kya?', timestamp: hours(1), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm4', content: 'Socha nahi abhi tak 😅', timestamp: hours(1), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm5', content: 'Haan bata, kya plan hai weekend ke liye?', timestamp: mins(2), isOutgoing: false, status: 'read', type: 'text' },
    ]
  },
  {
    id: '2',
    name: 'Arjun Mehta',
    avatar: 'AM',
    lastMessage: 'The PR is ready for review bro',
    lastMessageTime: mins(15),
    unreadCount: 0,
    isOnline: true,
    isTyping: true,
    isMuted: false,
    isPinned: true,
    phone: '+91 87654 32109',
    about: 'Code. Coffee. Repeat.',
    messages: [
      { id: 'm1', content: 'Bhai standup mein kya update dena hai?', timestamp: hours(3), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm2', content: 'Auth module complete ho gaya, testing chal rahi hai', timestamp: hours(3), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm3', content: 'Nice! Kab tak production jaega?', timestamp: hours(2), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm4', content: 'Friday tak hopefully 🤞', timestamp: hours(2), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm5', content: 'The PR is ready for review bro', timestamp: mins(15), isOutgoing: false, status: 'delivered', type: 'text' },
    ]
  },
  {
    id: '3',
    name: 'Family Group 👨‍👩‍👧‍👦',
    avatar: 'FG',
    lastMessage: 'Papa: Dinner pe aa jaana sab log',
    lastMessageTime: mins(45),
    unreadCount: 12,
    isOnline: false,
    isTyping: false,
    isMuted: true,
    isPinned: false,
    phone: '',
    about: 'Our happy family ❤️',
    messages: [
      { id: 'm1', content: 'Good morning everyone! 🌅', timestamp: hours(8), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm2', content: 'Good morning! 😊', timestamp: hours(7), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm3', content: 'Mummy: Beta khaana khaya?', timestamp: hours(4), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm4', content: 'Haan mummy khaa liya 😄', timestamp: hours(4), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm5', content: 'Papa: Dinner pe aa jaana sab log', timestamp: mins(45), isOutgoing: false, status: 'read', type: 'text' },
    ]
  },
  {
    id: '4',
    name: 'Priya Patel',
    avatar: 'PP',
    lastMessage: 'Sure! See you at 7 then 😊',
    lastMessageTime: hours(1),
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
    isMuted: false,
    isPinned: false,
    phone: '+91 76543 21098',
    about: 'Wanderlust & coffee addict',
    messages: [
      { id: 'm1', content: 'Movie ke liye jaana hai aaj?', timestamp: hours(3), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm2', content: 'Haan! Kaunsi movie?', timestamp: hours(3), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm3', content: 'Animal dekhi nahi tune? Wahi dekh lete hain', timestamp: hours(2), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm4', content: 'Perfect! Kitne baje?', timestamp: hours(2), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm5', content: '7 baje chalega?', timestamp: hours(1), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm6', content: 'Sure! See you at 7 then 😊', timestamp: hours(1), isOutgoing: false, status: 'read', type: 'text' },
    ]
  },
  {
    id: '5',
    name: 'College Friends 🎓',
    avatar: 'CF',
    lastMessage: 'Vikas: Reunion kab kar rahe hain yaar?',
    lastMessageTime: hours(3),
    unreadCount: 5,
    isOnline: false,
    isTyping: false,
    isMuted: false,
    isPinned: false,
    phone: '',
    about: 'BCA 2019 Batch 🎉',
    messages: [
      { id: 'm1', content: 'Koi hai?? 👋', timestamp: hours(5), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm2', content: 'Main hoon bhai!', timestamp: hours(5), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm3', content: 'Rahul: Kal ki class cancel ho gayi', timestamp: hours(4), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm4', content: 'Finally! 🎉🎉', timestamp: hours(4), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm5', content: 'Vikas: Reunion kab kar rahe hain yaar?', timestamp: hours(3), isOutgoing: false, status: 'read', type: 'text' },
    ]
  },
  {
    id: '6',
    name: 'Neha Gupta',
    avatar: 'NG',
    lastMessage: 'Thanks for the help! Really appreciate it ❤️',
    lastMessageTime: days(1),
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
    isMuted: false,
    isPinned: false,
    phone: '+91 65432 10987',
    about: 'Designer by day, dreamer by night',
    messages: [
      { id: 'm1', content: 'Bhai project mein ek problem aa rahi hai', timestamp: days(1), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm2', content: 'Bata kya hua?', timestamp: days(1), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm3', content: 'CSS alignment theek nahi ho rahi', timestamp: days(1), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm4', content: 'Flexbox try kar, parent mein display: flex aur align-items: center lagaa', timestamp: days(1), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm5', content: 'Thanks for the help! Really appreciate it ❤️', timestamp: days(1), isOutgoing: false, status: 'read', type: 'text' },
    ]
  },
  {
    id: '7',
    name: 'Rohit Kumar',
    avatar: 'RK',
    lastMessage: 'Bhai kal milte hain chai pe',
    lastMessageTime: days(2),
    unreadCount: 0,
    isOnline: false,
    isTyping: false,
    isMuted: false,
    isPinned: false,
    phone: '+91 54321 09876',
    about: 'Cricket fan forever 🏏',
    messages: [
      { id: 'm1', content: 'India jeet gayi!! 🏆🎉', timestamp: days(2), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm2', content: 'Haaan yaar kya match tha! Bumrah ne kya bowling ki!', timestamp: days(2), isOutgoing: true, status: 'read', type: 'text' },
      { id: 'm3', content: 'Virat bhi bahut accha khela', timestamp: days(2), isOutgoing: false, status: 'read', type: 'text' },
      { id: 'm4', content: 'Bhai kal milte hain chai pe', timestamp: days(2), isOutgoing: false, status: 'read', type: 'text' },
    ]
  },
]