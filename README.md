# 💬 Quibly

<div align="center">
  <img src="./assets/images/quibly-logo.png" alt="Quibly Logo" width="120" height="120">
  
  **AI-Powered Chat-Based Personal Assistant**
  
  [![React Native](https://img.shields.io/badge/React_Native-0.79.4-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-53.0.13-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-11.9.1-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
  [![NativeWind](https://img.shields.io/badge/NativeWind-4.1.23-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://nativewind.dev/)
  
  🚀 **The Future of Personal Organization**
</div>

---

## 🌟 About Quibly

Traditional note-taking apps force you to think in categories, navigate complex menus, and interrupt your flow. But thoughts don't come organized—they come naturally, conversationally, spontaneously.

**Quibly** revolutionizes personal organization by turning your scattered thoughts into structured productivity through natural conversation. Just type like you're texting a friend, and watch as your words transform into organized notes, smart reminders, actionable todos, and consistent routines.

### 🎯 Mission
To eliminate the friction between having a thought and organizing it, making personal productivity as natural as having a conversation.

---

## ✨ Key Features

### � **Natural Language Processing**
- Conversational interface that understands context
- AI-powered message parsing and smart categorization
- No more thinking about where to put things—just talk

### 📝 **Intelligent Organization**
- **Notes**: Capture thoughts and ideas instantly
- **Reminders**: Natural language time parsing ("remind me tomorrow at 3pm")
- **Todo Lists**: Task creation with automatic priority detection
- **Routines**: Habit building with flexible scheduling

### 🔄 **Smart Routine Management**
- Create custom daily/weekly routines through conversation
- Flexible start and end dates for temporary habits
- Intelligent suggestions based on your patterns
- Progress tracking with motivational insights

### 🔔 **Context-Aware Notifications**
- Time-based reminders with smart scheduling
- Background notifications that respect your focus time
- Customizable notification sounds and vibrations
- Location-based reminder triggers

### 🎨 **Beautiful, Intuitive Design**
- Chat-first interface with smooth animations
- Dark/light mode support
- Accessibility-focused design
- Gesture-based interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g @expo/cli`)
- Android Studio (for Android) or Xcode (for iOS)
- Firebase project with Firestore enabled

### 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/luthfibintang/Quibly.git
   cd Quibly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   ```bash
   # Update services/firebase.ts with your config
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     // ... rest of your config
   };
   ```

4. **Start development server**
   ```bash
   npx expo start
   ```

### 🌟 Usage

1. **Start Chatting**: Open the app and start typing naturally
2. **Smart Categorization**: Watch as Quibly automatically organizes your thoughts
3. **Set Reminders**: Say "remind me to call mom tomorrow at 2pm"
4. **Create Routines**: "I want to exercise every Monday, Wednesday, Friday at 7am"
5. **Manage Tasks**: "Add buy groceries to my todo list"
6. **Track Progress**: View your productivity insights and routine progress

---

## 🛠️ Tech Stack

### Frontend & Mobile
- **React Native 0.79.4** - Cross-platform mobile development
- **Expo 53.0.13** - Development platform and build tools
- **TypeScript 5.0+** - Type-safe development
- **Expo Router** - File-based navigation system
- **NativeWind 4.1.23** - Tailwind CSS for React Native
- **React Native Reanimated** - Smooth animations

### Backend & Database
- **Firebase Firestore** - Real-time NoSQL database
- **Firebase Cloud Functions** - Serverless backend logic
- **Expo Notifications** - Push notification service
- **Expo Background Tasks** - Background processing

### AI & Intelligence
- **Natural Language Processing** - Message parsing and categorization
- **Smart Scheduling** - Intelligent reminder timing
- **Pattern Recognition** - Routine optimization
- **Context Awareness** - Adaptive user experience

---

## 📱 App Structure

```
app/
├── (tabs)/                    # Main navigation tabs
│   ├── index.tsx              # 💬 Chat interface (main)
│   ├── categoryDashboard.tsx  # 📊 Overview dashboard
│   └── routines.tsx           # 🔄 Routine management
├── categories/                # Category-specific screens
│   ├── notes.tsx              # 📝 Notes management
│   ├── reminder.tsx           # ⏰ Reminders management
│   └── todolist.tsx           # ✅ Todo management
└── routines/                  # Routine-specific screens
    ├── [id].tsx               # 📋 Routine details
    ├── createRoutines.tsx     # ➕ Create routine
    └── editRoutines.tsx       # ✏️ Edit routine

components/                    # Reusable UI components
├── BubbleChat.tsx            # 💭 Chat message bubbles
├── CategoryCard.tsx          # 🎴 Category overview cards
├── FilterButtons.tsx         # 🔍 Filter controls
├── RoutineItem.tsx           # 📅 Routine list items
└── TaskItem.tsx              # ✓ Task list items
```

---

## 📱 Screenshots & Design

<div align="center">
  <img src="./assets/images/mockups/Landing Page.png" alt="Landing Page" width="22%">
  <img src="./assets/images/mockups/Chat Message Page.jpeg" alt="Chat Interface" width="22%">
  <img src="./assets/images/mockups/Category Dashboard Page.jpeg" alt="Dashboard" width="22%">
  <img src="./assets/images/mockups/Create Routines Page.jpeg" alt="Create Routine" width="22%">
</div>

<div align="center">
  <img src="./assets/images/mockups/Notes Page.jpeg" alt="Notes" width="22%">
  <img src="./assets/images/mockups/Reminder Page.jpeg" alt="Reminders" width="22%">
  <img src="./assets/images/mockups/TodoList Page.jpeg" alt="Todo List" width="22%">
  <img src="./assets/images/mockups/Routines Page.jpeg" alt="Routines" width="22%">
</div>

---

## � Technical Deep Dive

### Message Processing Pipeline
1. **Input Capture** - Real-time text input with typing indicators
2. **Context Analysis** - Understanding user intent and message context
3. **Entity Extraction** - Parsing dates, times, tasks, and categories
4. **Smart Categorization** - AI-powered classification into notes/reminders/todos
5. **Data Storage** - Structured storage in Firebase Firestore
6. **Response Generation** - Contextual feedback and confirmation

### Notification Intelligence
- **Smart Scheduling** - Optimal notification timing based on user patterns
- **Context Awareness** - Respect for focus time and sleep schedules
- **Progressive Reminders** - Escalating reminder strategies for important tasks
- **Location Integration** - Geofenced reminders and context-aware notifications

### Routine Optimization
- **Habit Stacking** - Intelligent routine chaining suggestions
- **Flexibility Management** - Adaptive scheduling for life changes
- **Progress Analytics** - Detailed insights into habit formation
- **Motivation Engine** - Personalized encouragement and milestone celebrations

---

## 🎯 Roadmap & Future Features

### 🔮 **AI Enhancements**
- [ ] Voice input and voice responses
- [ ] Predictive text suggestions based on patterns
- [ ] Smart routine recommendations
- [ ] Mood and productivity correlation analysis

### 📊 **Analytics & Insights**
- [ ] Advanced productivity analytics dashboard
- [ ] Weekly/monthly productivity reports
- [ ] Goal tracking and achievement visualization
- [ ] Habit formation success predictions

### 🌐 **Platform Expansion**
- [ ] Web application companion
- [ ] Apple Watch and wearable integration
- [ ] Smart home device integration (Alexa, Google Home)
- [ ] Calendar app synchronization

### 🤝 **Social Features**
- [ ] Shared routines and accountability partners
- [ ] Family/team productivity dashboards
- [ ] Community-driven routine templates
- [ ] Productivity challenges and gamification

---

## 🤝 Contributing

I love contributions from the community! Here's how you can help make Quibly even better:

1. **Fork the repository**
2. **Create your feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation for API changes
- Follow the existing code style and patterns

---

<div align="center">
  <p><strong>💬 Think It. Say It. Organize It. 💬</strong></p>
  
  **Made with ❤️ for productivity enthusiasts and powered by conversation**
  
  ⭐ **Star this repository if you found it helpful!** ⭐
</div>
