import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
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
  listenToMessages: (callback: (messages: FirebaseChatMessage[]) => void) => {
    return onSnapshot(
      query(collection(db, 'messages'), orderBy('timestamp', 'asc')),
      (snapshot) => {
        const messages: FirebaseChatMessage[] = [];
        snapshot.forEach((doc) => {
          messages.push({
            id: doc.id,
            ...doc.data(),
          } as FirebaseChatMessage);
        });
        callback(messages);
      },
      (error) => {
        console.error('Error listening to messages:', error);
        callback([]);
      }
    );
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
  },


// === ROUTINES FUNCTIONS ===
  addRoutine: async (routineData: {
    message: string;
    startDate: Date;
    endDate: Date | null;
    selectedDays: string[];
  }): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, 'routines'), {
        ...routineData,
        isEnabled: true, // Default status saat dibuat
        created_at: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error("Error adding routine: ", error);
      throw error;
    }
  },

  // Listen untuk perubahan routines
  listenToRoutines: (callback: (routines: FirebaseRoutine[]) => void) => {
    const q = query(collection(db, 'routines'), orderBy('created_at', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const routines: FirebaseRoutine[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();

        // --- KUNCI PERBAIKAN ADA DI SINI ---
        // Hanya proses dokumen jika timestamp penting (startDate dan created_at) ada.
        if (data.startDate && data.created_at) {
          routines.push({
            id: doc.id,
            // Kita tidak memakai ...data lagi untuk kejelasan
            message: data.message,
            selectedDays: data.selectedDays,
            isEnabled: data.isEnabled,
            
            // Konversi yang aman
            startDate: data.startDate.toDate(),
            endDate: data.endDate ? data.endDate.toDate() : null, // Cek jika endDate ada
            created_at: data.created_at.toDate(),

          } as FirebaseRoutine);
        } else {
            console.warn(`Skipping malformed routine document: ${doc.id}`);
        }
      });
      callback(routines);
    },
    (error) => {
      console.error("Error listening to routines: ", error);
      callback([]);
    });
  },

  // Update status enabled/disabled rutin
  updateRoutineStatus: async (routineId: string, isEnabled: boolean): Promise<void> => {
    try {
      const routineRef = doc(db, 'routines', routineId);
      await updateDoc(routineRef, { isEnabled });
    } catch (error) {
      console.error("Error updating routine status: ", error);
      throw error;
    }
  },

  getRoutineById: async (routineId: string): Promise<FirebaseRoutine | null> => {
    try {
      const docRef = doc(db, 'routines', routineId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Konversi Timestamps ke Dates
        return {
          id: docSnap.id,
          ...data,
          startDate: data.startDate.toDate(),
          endDate: data.endDate ? data.endDate.toDate() : null,
          created_at: data.created_at.toDate(),
        } as FirebaseRoutine;
      } else {
        console.log("No such routine document!");
        return null;
      }
    } catch (error) {
      console.error("Error getting routine by ID: ", error);
      throw error;
    }
  },

  // Update sebuah routine yang sudah ada
  updateRoutine: async (routineId: string, updatedData: {
    message: string;
    startDate: Date;
    endDate: Date | null;
    selectedDays: string[];
  }): Promise<void> => {
    try {
      const routineRef = doc(db, 'routines', routineId);
      // SDK Firebase secara otomatis mengkonversi Date ke Timestamp
      await updateDoc(routineRef, updatedData);
    } catch (error) {
      console.error("Error updating routine: ", error);
      throw error;
    }
  },

  // Hapus sebuah routine
  deleteRoutine: async (routineId: string): Promise<void> => {
    try {
      const routineRef = doc(db, 'routines', routineId);
      await deleteDoc(routineRef);
    } catch (error) {
      console.error("Error deleting routine: ", error);
      throw error;
    }
  },
};