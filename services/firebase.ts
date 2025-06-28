import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where
} from 'firebase/firestore';


const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: "quibly-app.firebaseapp.com",
  projectId: "quibly-app",
  storageBucket: "quibly-app.firebasestorage.app",
  messagingSenderId: "678616210580",
  appId: "1:678616210580:web:478ad8c80da92e53c76881",
  measurementId: "G-PCB9GM5F4L"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Database helper functions untuk Quibly
export const QuiblyDB = {

  // === MESSAGES FUNCTIONS ===
  // Tambah pesan baru
  // type: 'sender' untuk pesan dari pengguna, 'answer' untuk jawaban sistem
  addMessage: async (message: string, type: 'sender' | 'answer'): Promise<string> => {
        try {
            const docRef = await addDoc(collection(db, 'messages'), {
                message, // field: 'message'
                type,    // field: 'type'
                timestamp: serverTimestamp() // field: 'timestamp'
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding message: ", error);
            throw error;
        }
    },

  // Listen untuk perubahan pesan
  getMessages: async () => {
    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc')); // Urutkan berdasarkan waktu
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },
  // === NOTES FUNCTIONS ===
  
  // Tambah catatan baru
  addNote: async (content: string): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'notes'), {
        content,
        created_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding note: ", error);
      throw error;
    }
  },

  // Listen untuk perubahan notes
  listenToNotes: (callback: (notes: FirebaseNote[]) => void) => {
    const q = query(collection(db, 'notes'), orderBy('created_at', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const notes: FirebaseNote[] = [];
      querySnapshot.forEach((doc) => {
        notes.push({ id: doc.id, ...doc.data() } as FirebaseNote);
      });
      callback(notes);
    });
  },

  // Delete note
  deleteNote: async (noteId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'notes', noteId));
    } catch (error) {
      console.error("Error deleting note: ", error);
      throw error;
    }
  },

  // === REMINDERS FUNCTIONS ===
  
  // Tambah reminder baru
  addReminder: async (content: string, parsedTime: Date): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'reminders'), {
        content,
        created_at: serverTimestamp(),
        parsed_time: parsedTime,
        is_completed: false
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding reminder: ", error);
      throw error;
    }
  },

  // Listen untuk perubahan reminders
  listenToReminders: (callback: (reminders: FirebaseReminder[]) => void) => {
    const q = query(collection(db, 'reminders'), orderBy('created_at', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const reminders: FirebaseReminder[] = [];
      querySnapshot.forEach((doc) => {
        reminders.push({ id: doc.id, ...doc.data() } as FirebaseReminder);
      });
      callback(reminders);
    });
  },

  // Listen untuk active reminders saja
  listenToActiveReminders: (callback: (reminders: FirebaseReminder[]) => void) => {
    const q = query(
      collection(db, 'reminders'), 
      where('is_completed', '==', false),
      orderBy('created_at', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const reminders: FirebaseReminder[] = [];
      querySnapshot.forEach((doc) => {
        reminders.push({ id: doc.id, ...doc.data() } as FirebaseReminder);
      });
      callback(reminders);
    });
  },

  // Update status reminder
  updateReminderStatus: async (reminderId: string, isCompleted: boolean): Promise<void> => {
    try {
      const reminderRef = doc(db, 'reminders', reminderId);
      await updateDoc(reminderRef, {
        is_completed: isCompleted
      });
    } catch (error) {
      console.error("Error updating reminder: ", error);
      throw error;
    }
  },

  // Delete reminder
  deleteReminder: async (reminderId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'reminders', reminderId));
    } catch (error) {
      console.error("Error deleting reminder: ", error);
      throw error;
    }
  },

  // === TODOLIST FUNCTIONS ===
  
  // Tambah todo baru
  addTodo: async (content: string, dueDate?: string): Promise<string> => {
    try {
      const todoData: any = {
        content,
        created_at: serverTimestamp(),
        is_completed: false
      };
      
      // Tambahkan due_date jika ada
      if (dueDate) {
        todoData.due_date = dueDate;
      }

      const docRef = await addDoc(collection(db, 'todolist'), todoData);
      return docRef.id;
    } catch (error) {
      console.error("Error adding todo: ", error);
      throw error;
    }
  },

  // Listen untuk perubahan todolist
  listenToTodos: (callback: (todos: FirebaseTodo[]) => void) => {
    const q = query(collection(db, 'todolist'), orderBy('created_at', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const todos: FirebaseTodo[] = [];
      querySnapshot.forEach((doc) => {
        todos.push({ id: doc.id, ...doc.data() } as FirebaseTodo);
      });
      callback(todos);
    });
  },

  // Listen untuk active todos saja
  listenToActiveTodos: (callback: (todos: FirebaseTodo[]) => void) => {
    const q = query(
      collection(db, 'todolist'), 
      where('is_completed', '==', false),
      orderBy('created_at', 'desc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const todos: FirebaseTodo[] = [];
      querySnapshot.forEach((doc) => {
        todos.push({ id: doc.id, ...doc.data() } as FirebaseTodo);
      });
      callback(todos);
    });
  },

  // Update status todo
  updateTodoStatus: async (todoId: string, isCompleted: boolean): Promise<void> => {
    try {
      const todoRef = doc(db, 'todolist', todoId);
      await updateDoc(todoRef, {
        is_completed: isCompleted
      });
    } catch (error) {
      console.error("Error updating todo: ", error);
      throw error;
    }
  },

  // Update due date todo
  updateTodoDueDate: async (todoId: string, dueDate: string): Promise<void> => {
    try {
      const todoRef = doc(db, 'todolist', todoId);
      await updateDoc(todoRef, {
        due_date: dueDate
      });
    } catch (error) {
      console.error("Error updating todo due date: ", error);
      throw error;
    }
  },

  // Delete todo
  deleteTodo: async (todoId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'todolist', todoId));
    } catch (error) {
      console.error("Error deleting todo: ", error);
      throw error;
    }
  },

  // === UTILITY FUNCTIONS ===
  
  // Get overdue todos
  listenToOverdueTodos: (callback: (todos: FirebaseTodo[]) => void) => {
    const now = new Date().toISOString();
    const q = query(
      collection(db, 'todolist'),
      where('is_completed', '==', false),
      where('due_date', '<', now),
      orderBy('due_date', 'asc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const todos: FirebaseTodo[] = [];
      querySnapshot.forEach((doc) => {
        todos.push({ id: doc.id, ...doc.data() } as FirebaseTodo);
      });
      callback(todos);
    });
  },

  // Get upcoming reminders (dalam 24 jam ke depan)
  listenToUpcomingReminders: (callback: (reminders: FirebaseReminder[]) => void) => {
    const now = new Date().toISOString();
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    
    const q = query(
      collection(db, 'reminders'),
      where('is_completed', '==', false),
      where('parsed_time', '>=', now),
      where('parsed_time', '<=', tomorrow),
      orderBy('parsed_time', 'asc')
    );
    return onSnapshot(q, (querySnapshot) => {
      const reminders: FirebaseReminder[] = [];
      querySnapshot.forEach((doc) => {
        reminders.push({ id: doc.id, ...doc.data() } as FirebaseReminder);
      });
      callback(reminders);
    });
  }
};