# Kamikaz Interview AI 🚀

An AI-powered FAANG interview preparation platform with natural conversation flow and voice interaction.

## ✨ Features

### 🎤 **Natural Voice Interaction**
- Real-time speech recognition with voice activity detection
- Natural conversation flow with interruption support
- Automatic microphone permission handling
- Clean text-to-speech without markdown formatting

### 🤖 **Enhanced AI Interview Experience**
- Conversational AI responses (no more robotic speech)
- "Ask for Help" button for guidance during interviews
- Real-time transcript display
- Conversation history tracking
- Contextual AI feedback and follow-up questions

### 💼 **Interview Types**
- Technical interviews
- Behavioral interviews  
- System design interviews
- Company-specific preparation (Google, Meta, Amazon, Apple, Microsoft, Netflix)

### 🧠 **Practice Problems**
- Coding challenges with AI evaluation
- Real-time code feedback
- Multiple difficulty levels
- Company-tagged problems

### 📊 **Analytics & Tracking**
- Interview performance tracking
- Progress analytics
- Personalized recommendations
- Solution history

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **AI**: Google Gemini AI, Voice Recognition API
- **Database**: Supabase (PostgreSQL)
- **Voice**: Web Speech API, Speech Synthesis API

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ 
- npm or pnpm
- Modern browser (Chrome, Edge, Safari) for voice features

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ginxmaster4/kamikaz-interview-ai.git
cd kamikaz-interview-ai
```

2. **Install dependencies**
```bash
npm install --legacy-peer-deps
```

3. **Set up environment variables**
Create a `.env.local` file with:
```env
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini AI (Required)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key

# Optional: Additional AI APIs
XAI_API_KEY=your_xai_api_key
GROQ_API_KEY=your_groq_api_key
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 **Key Improvements Made**

### Voice Interaction Enhancements
- ✅ Fixed microphone permission handling
- ✅ Added automatic voice activity detection  
- ✅ Implemented speech interruption support
- ✅ Enhanced error messages with user guidance

### AI Conversation Flow
- ✅ Natural, conversational AI responses
- ✅ Removed robotic markdown reading
- ✅ Added contextual help system
- ✅ Real-time conversation tracking

### User Experience
- ✅ Intuitive microphone permission flow
- ✅ Clear error messages with solutions
- ✅ Visual feedback for all interaction states
- ✅ Seamless conversation experience

## 📱 **Usage**

1. **Create Account**: Enter PIN, name, and interests
2. **Choose Interview Type**: Select technical, behavioral, or system design
3. **Grant Microphone Permission**: Click "Allow Microphone Access"
4. **Start Interview**: Begin natural voice conversation with AI
5. **Get Help**: Use "Ask for Help" button anytime during interview
6. **Review Performance**: Check analytics and feedback

## 🔧 **Features in Detail**

### Natural Conversation Flow
- AI speaks naturally without reading formatting symbols
- Users can interrupt AI anytime to ask questions
- Automatic detection of speech end (no manual button pressing)
- Real-time transcript display as you speak

### Help System
- Dedicated "Ask for Help" button always available
- AI detects natural help requests in speech ("I need help", "explain this")
- Contextual guidance without giving away answers
- Encouraging, supportive responses

### Voice Technology
- Advanced speech recognition with noise cancellation
- Automatic microphone permission management
- Cross-browser compatibility (Chrome, Edge, Safari)
- Graceful fallbacks for unsupported browsers

## 🤝 **Contributing**

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- Google Gemini AI for natural language processing
- Supabase for backend infrastructure
- Radix UI for accessible components
- Next.js team for the amazing framework

---

**Built with ❤️ for interview success** 🎯
