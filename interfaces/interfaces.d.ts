// Types untuk TypeScript sesuai struktur database baru
interface NoteData {
  content: string;
  created_at: Timestamp;
}

interface ReminderData {
  content: string;
  created_at: Timestamp;
  parsed_time: Timestamp; // Format: "2025-06-28T20:00:00.000+07:00" atau waktu yang diparsing
  is_completed: boolean;
}

interface TodoData {
  content: string;
  created_at: Timestamp;
  is_completed: boolean;
  due_date?: string; // Optional - format ISO string atau null
}

interface ChatMessageData {
  message: string;
  type: 'sender' | 'answer';
  timestamp: Timestamp;
}

interface RoutineData {
  message: string;
  startDate: Timestamp; // Di Firestore, kita simpan sebagai Timestamp
  endDate: Timestamp | null; // Bisa Timestamp atau null
  selectedDays: string[];
  isEnabled: boolean;
  created_at: Timestamp;
}

// Firebase document interfaces (dengan ID)
interface FirebaseNote extends NoteData {
  id: string;
}

interface FirebaseReminder extends ReminderData {
  id: string;
}

interface FirebaseTodo extends TodoData {
  id: string;
}

interface FirebaseChatMessage extends ChatMessageData {
 id: string;
}

interface FirebaseRoutine extends RoutineData {
  id: string;
}