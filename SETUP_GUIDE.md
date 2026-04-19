# WhatsApp Clone - Setup & Features Guide

## ✅ Recent Updates

### 1. **AI Features Fixed** 🤖
- Created `.env.local` file for API key configuration
- All Gemini API integration is ready to use

### 2. **File Attachment Features Added** 📎
- Upload photos from computer
- Upload documents (PDF, Word, Excel, PowerPoint, etc.)
- File preview before sending
- Click to download/view files
- File size display
- Support for multiple attachments at once

---

## 🚀 Setup Instructions

### Step 1: Get Your Gemini API Key
1. Go to https://makersuite.google.com/app/apikey
2. Create or copy your API key
3. Open `.env.local` in the project root
4. Replace `your_api_key_here` with your actual API key

Example:
```
VITE_GEMINI_API_KEY=AIzaSyD_...your_key_here...
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Run Development Server
```bash
npm run dev
```

---

## 📝 Features

### Messaging
- Send text messages ✨
- Real-time AI responses from chat contacts
- Smart reply suggestions
- Typing indicators

### File Attachments
1. Click the **📎 Paperclip** button in message input
2. Choose **Photos** or **Documents**
3. Select one or multiple files
4. See preview with file size
5. Remove files before sending if needed
6. Click send to attach and send files

### File Types Supported
- **Images**: JPG, PNG, GIF, WebP, etc.
- **Documents**: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT

### Receiving Files
- View image attachments inline
- Click images to open full size
- Download icon on hover
- View documents as downloadable items
- Click download button to save files

---

## 🎨 Customization

### Add More Document Types
Edit `MessageInput.tsx` line ~170:
```jsx
accept=".pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx"
```

### Adjust File Size Display
The app supports any file size, but you may want to add validation. Edit `MessageInput.tsx` to add size limits:
```jsx
if (file.size > 25 * 1024 * 1024) { // 25MB limit
  alert('File too large');
  return;
}
```

---

## 🐛 Troubleshooting

### AI not responding?
- Verify `.env.local` file exists with correct API key
- Check browser console for error messages (F12)
- Ensure API key has necessary permissions on Google Cloud

### Files not displaying?
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for errors
- Ensure files are not corrupted

### Large files slow?
- Base64 encoding is used for simplicity in this demo
- For production, use cloud storage instead

---

## 📦 Project Structure
```
src/
  ├── components/
  │   └── ChatWindow/
  │       ├── MessageInput.tsx      (File upload logic here)
  │       └── MessageBubble.tsx     (File display logic here)
  ├── context/
  │   └── ChatContext.tsx           (Message handling)
  ├── lib/
  │   ├── gemini.ts                 (API setup)
  │   └── geminiChat.ts             (AI responses)
  └── types/
      └── index.ts                  (Message & Attachment types)
```

---

## 🎯 Next Steps (Optional Enhancements)
- Add camera capture feature
- Add location sharing
- Add voice message recording
- Add message reactions
- Add message search
- Add contact sharing

---

**Enjoy your WhatsApp Clone!** 🎉
