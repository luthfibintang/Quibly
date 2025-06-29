// hooks/useReminder.ts
import { QuiblyDB } from '@/services/firebase';
import { ReminderService } from '@/services/reminderService';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

export const useReminder = () => {
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    // Setup reminder system saat component mount
    const initializeReminderSystem = async () => {
      try {
        await ReminderService.setup();
      } catch (error) {
        console.error('Failed to initialize reminder system:', error);
      }
    };

    initializeReminderSystem();

    // Listen untuk notifikasi yang diterima
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      
      // Jika notifikasi adalah reminder, bisa tambah logic khusus di sini
      if (notification.request.content.data?.type === 'reminder') {
        // Handle reminder notification received
        console.log('Reminder notification received');
      }
    });

    // Listen untuk response terhadap notifikasi
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      
      const reminderId = response.notification.request.content.data?.reminderId;
      if (reminderId && response.notification.request.content.data?.type === 'reminder') {
        // User tapped pada reminder notification
        // Bisa navigasi ke halaman reminder atau mark as completed
        handleReminderNotificationTap(reminderId);
      }
    });

    // Cleanup listeners saat component unmount
    return () => {
      // Gunakan method remove() yang baru, bukan removeNotificationSubscription yang deprecated
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
      // Stop foreground reminder check jika masih berjalan
      ReminderService.stopForegroundCheck();
    };
  }, []);

  // Handle ketika user tap reminder notification
  const handleReminderNotificationTap = async (reminderId: string) => {
    try {
      // Mark reminder as completed ketika user tap notifikasi
      await QuiblyDB.updateReminderStatus(reminderId, true);
      console.log(`Reminder ${reminderId} marked as completed`);
    } catch (error) {
      console.error('Error handling reminder notification tap:', error);
    }
  };

  // Manual check reminders (bisa dipanggil dari UI)
  const checkReminders = async () => {
    try {
      await ReminderService.checkReminders();
    } catch (error) {
      console.error('Error checking reminders manually:', error);
    }
  };

  return {
    checkReminders,
  };
};