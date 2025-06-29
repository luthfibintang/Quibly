// services/reminderService.ts
import * as Notifications from 'expo-notifications';
import { QuiblyDB } from './firebase';

// Import interface
interface FirebaseReminder {
  id: string;
  content: string;
  created_at: any;
  parsed_time: any;
  is_completed: boolean;
}

// Konfigurasi notifikasi (fixed deprecated warnings)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Variasi pesan reminder yang friendly & casual saja
const reminderMessages = [
  "Hey, jangan lupa untuk {content} 🔔",
  "Halo! Waktunya {content} nih 😊", 
  "Ping! {content} sedang menunggu ✨",
  "Psst... {content} nih! 🤫",
  "Yuk, saatnya {content}! 🌟",
  "Halo! Ada yang perlu kamu ingat: {content} 💭",
  "Waktunya {content}! 📝",
];

// Flag untuk foreground interval
let foregroundInterval: any = null;

// Fungsi untuk mendapatkan pesan random yang friendly & casual
const getRandomReminderMessage = (content: string): string => {
  const randomIndex = Math.floor(Math.random() * reminderMessages.length);
  const template = reminderMessages[randomIndex];
  return template.replace('{content}', content);
};

// Fungsi untuk request permission notifikasi
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

// Fungsi untuk mengirim notifikasi
export const sendReminderNotification = async (
  title: string, 
  body: string, 
  reminderId: string
): Promise<void> => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        data: {
          reminderId,
          type: 'reminder'
        },
      },
      trigger: null, // Kirim sekarang
    });
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Fungsi untuk mengirim pesan reminder ke chat
export const sendReminderMessage = async (content: string): Promise<void> => {
  try {
    const reminderMessage = getRandomReminderMessage(content);
    
    // Simpan pesan reminder ke Firebase
    await QuiblyDB.addMessage(reminderMessage, 'answer');
    
    console.log('Reminder message sent:', reminderMessage);
  } catch (error) {
    console.error('Error sending reminder message:', error);
  }
};

// Fungsi untuk mengecek dan memproses reminder yang sudah waktunya
export const checkAndProcessReminders = async (): Promise<void> => {
  try {
    console.log('🔍 Checking for due reminders...');
    
    // Ambil semua reminder yang belum completed
    const reminders = await new Promise<FirebaseReminder[]>((resolve) => {
      const unsubscribe = QuiblyDB.listenToActiveReminders((reminderList) => {
        unsubscribe(); // Stop listening setelah dapat data
        resolve(reminderList);
      });
    });

    console.log(`📋 Found ${reminders.length} active reminders to check`);

    const now = new Date();
    console.log(`⏰ Current time: ${now.toLocaleString('id-ID')}`);

    const dueReminders = reminders.filter(reminder => {
      if (!reminder.parsed_time) {
        console.log(`⚠️ Skipping reminder "${reminder.content}" - no parsed_time`);
        return false;
      }
      
      let reminderTime: Date;
      
      // Handle different timestamp formats
      if (typeof reminder.parsed_time === 'string') {
        reminderTime = new Date(reminder.parsed_time);
      } else if (reminder.parsed_time.toDate && typeof reminder.parsed_time.toDate === 'function') {
        reminderTime = reminder.parsed_time.toDate();
      } else if (reminder.parsed_time.seconds) {
        reminderTime = new Date(reminder.parsed_time.seconds * 1000);
      } else {
        reminderTime = new Date(reminder.parsed_time);
      }

      // Log detail untuk setiap reminder
      console.log(`📝 Checking reminder: "${reminder.content}"`);
      console.log(`   Scheduled for: ${reminderTime.toLocaleString('id-ID')}`);
      console.log(`   Is completed: ${reminder.is_completed}`);
      
      // Cek apakah waktu reminder sudah tiba (dengan toleransi yang lebih besar)
      const timeDiff = now.getTime() - reminderTime.getTime();
      // Toleransi 2 menit: dari 30 detik sebelum sampai 90 detik setelah waktu yang ditentukan
      const isDue = timeDiff >= -30000 && timeDiff <= 90000;
      
      console.log(`   Time difference: ${Math.round(timeDiff / 1000)} seconds`);
      console.log(`   Is due: ${isDue}`);
      
      return isDue;
    });

    console.log(`🔔 Found ${dueReminders.length} due reminders to process`);

    // Process setiap reminder yang sudah waktunya
    for (const reminder of dueReminders) {
      try {
        console.log(`📤 Processing reminder: "${reminder.content}"`);
        
        // Kirim notifikasi
        await sendReminderNotification(
          'Quibly Reminder',
          `${reminder.content} 🔔`,
          reminder.id
        );
        console.log(`✅ Notification sent for: "${reminder.content}"`);

        // Kirim pesan ke chat
        await sendReminderMessage(reminder.content);
        console.log(`💬 Chat message sent for: "${reminder.content}"`);

        // Update status reminder menjadi completed
        await QuiblyDB.updateReminderStatus(reminder.id, true);
        console.log(`☑️ Reminder marked as completed: "${reminder.content}"`);

        console.log(`🎉 Successfully processed reminder: ${reminder.content}`);
      } catch (error) {
        console.error(`❌ Error processing reminder ${reminder.id}:`, error);
      }
    }

    if (dueReminders.length === 0) {
      console.log('😴 No due reminders at this time');
    }
  } catch (error) {
    console.error('💥 Error checking reminders:', error);
  }
};

// Fungsi alternatif menggunakan foreground interval
export const startForegroundReminderCheck = (): void => {
  if (foregroundInterval) {
    clearInterval(foregroundInterval);
  }
  
  console.log('Starting foreground reminder checker (60 second intervals)');
  foregroundInterval = setInterval(async () => {
    try {
      await checkAndProcessReminders();
    } catch (error) {
      console.error('Foreground reminder check error:', error);
    }
  }, 60000); // Check setiap 1 menit
};

// Fungsi untuk stop foreground interval
export const stopForegroundReminderCheck = (): void => {
  if (foregroundInterval) {
    clearInterval(foregroundInterval);
    foregroundInterval = null;
    console.log('Foreground reminder checker stopped');
  }
};

// Fungsi untuk setup reminder system (tanpa background task deprecated)
export const setupReminderSystem = async (): Promise<void> => {
  try {
    console.log('Setting up reminder system...');
    
    // Request notification permissions
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      console.warn('Notification permission not granted');
      return;
    }

    // Langsung gunakan foreground checker (lebih stabil)
    console.log('Using foreground reminder checking (no deprecated background tasks)');
    startForegroundReminderCheck();
    
    console.log('Reminder system setup completed');
  } catch (error) {
    console.error('Error setting up reminder system:', error);
    // Fallback ke foreground mode jika ada error
    console.log('Falling back to foreground reminder checking');
    startForegroundReminderCheck();
  }
};

// Fungsi untuk debug - memaksa check reminder (untuk testing)
export const debugCheckReminders = async (): Promise<void> => {
  console.log('=== DEBUG: Manual reminder check ===');
  await checkAndProcessReminders();
  console.log('=== DEBUG: Manual reminder check completed ===');
};

// Fungsi untuk mengirim test reminder (untuk testing)
export const sendTestReminder = async (): Promise<void> => {
  console.log('=== DEBUG: Sending test reminder ===');
  
  // Kirim test notification
  await sendReminderNotification(
    'Test Reminder',
    'Ini adalah test reminder dari Quibly! 🔔',
    'test-reminder-id'
  );
  
  // Kirim test message
  await sendReminderMessage('minum air putih');
  
  console.log('=== DEBUG: Test reminder sent ===');
};

// Export utilities (cleaned up, no deprecated functions)
export const ReminderService = {
  setup: setupReminderSystem,
  checkReminders: checkAndProcessReminders,
  sendNotification: sendReminderNotification,
  sendMessage: sendReminderMessage,
  requestPermissions: requestNotificationPermissions,
  startForegroundCheck: startForegroundReminderCheck,
  stopForegroundCheck: stopForegroundReminderCheck,
  // Debug functions
  debugCheck: debugCheckReminders,
  sendTestReminder: sendTestReminder,
};
