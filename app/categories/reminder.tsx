import FilterButtons from '@/components/FilterButtons';
import TaskItem from '@/components/TaskItem';
import { icons } from '@/constants/icons';
import { QuiblyDB } from '@/services/firebase'; // Import Firebase database functions
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReminderItem {
  id: string;
  content: string;
  created_at: string;
  is_completed: boolean;
  parsed_time: string;
}

// Fungsi untuk menentukan label section berdasarkan waktu
function formatReminderDateLabel(dateString: string): string {
  const targetDate = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfDayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  if (targetDate >= startOfToday && targetDate < startOfTomorrow) {
    return 'Today';
  } else if (targetDate >= startOfTomorrow && targetDate < startOfDayAfterTomorrow) {
    return 'Tomorrow';
  } else if (targetDate >= startOfYesterday && targetDate < startOfToday) {
    return 'Yesterday';
  } else {
    return targetDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    });
  }
}

export default function Reminder() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('today');
  const [showFinished, setShowFinished] = useState(false);
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to reminders from Firebase on component mount
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = QuiblyDB.listenToReminders((firebaseReminders: FirebaseReminder[]) => {
      try {
        // Transform Firebase data to match our interface
        const transformedReminders: ReminderItem[] = firebaseReminders.map(reminder => ({
          id: reminder.id,
          content: reminder.content,
          created_at: reminder.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          is_completed: reminder.is_completed,
          parsed_time: reminder.parsed_time?.toDate?.()?.toISOString() || new Date().toISOString()
        }));
        
        setReminders(transformedReminders);
        setLoading(false);
      } catch (err) {
        console.error('Error processing reminders:', err);
        setError('Failed to process reminders');
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadReminders = () => {
    setError(null);
  };

  const handleToggleComplete = async (id: string) => {
    try {
      // Find the current reminder to get its current status
      const currentReminder = reminders.find(r => r.id === id);
      if (!currentReminder) return;

      const newCompletedStatus = !currentReminder.is_completed;

      // Update in Firebase - the real-time listener will update the UI
      await QuiblyDB.updateReminderStatus(id, newCompletedStatus);
      
      // console.log(`Reminder ${id} status updated to: ${newCompletedStatus}`);
    } catch (error) {
      console.error('Error updating reminder status:', error);
      setError('Failed to update reminder status');
    }
  };

  const filteredReminders = useMemo(() => {
    const today = new Date().toDateString();

    let filtered = reminders;

    if (activeFilter === 'today') {
      filtered = filtered.filter(reminder => {
        const reminderDate = new Date(reminder.parsed_time).toDateString();
        return reminderDate === today;
      });
    } else if (activeFilter === 'upcoming') {
      filtered = filtered.filter(reminder => {
        const reminderDate = new Date(reminder.parsed_time);
        return reminderDate > new Date();
      });
    }

    if (!showFinished) {
      filtered = filtered.filter(reminder => !reminder.is_completed);
    }

    return filtered;
  }, [reminders, activeFilter, showFinished]);

  const { completedReminders, pendingReminders } = useMemo(() => {
    const completed = filteredReminders.filter(r => r.is_completed);
    const pending = filteredReminders.filter(r => !r.is_completed);
    return { completedReminders: completed, pendingReminders: pending };
  }, [filteredReminders]);

  // Group reminders by label (Today, Tomorrow, etc.)
  const groupedReminders = useMemo(() => {
    const groups: { [label: string]: ReminderItem[] } = {};
    pendingReminders.forEach(reminder => {
      const label = formatReminderDateLabel(reminder.parsed_time);
      if (!groups[label]) groups[label] = [];
      groups[label].push(reminder);
    });
    return groups;
  }, [pendingReminders]);

  const router = useRouter();

  // Show loading state
  if (loading) {
    return (
      <View className="flex-1 bg-black">
        {/* Header */}
        <View
          className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800"
          style={{ paddingTop: insets.top + 16 }}
        >
          <TouchableOpacity onPress={() => router.back()}>
            <Image
              source={icons.left}
              className="w-8 h-8"
              style={{ tintColor: '#ffffff' }}
            />
          </TouchableOpacity>

          <Text className="text-white text-xl font-semibold">
            Reminder
          </Text>

          <View className="w-6" />
        </View>

        {/* Loading State */}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-gray-500 text-base mt-4">Loading reminders...</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Image
            source={icons.left}
            className="w-8 h-8"
            style={{ tintColor: '#ffffff' }}
          />
        </TouchableOpacity>

        <Text className="text-white text-xl font-semibold">
          Reminder
        </Text>

        <TouchableOpacity onPress={loadReminders}>
          <Text className="text-mainPurple text-sm">Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View className="px-6 py-2 bg-red-900/20">
          <Text className="text-red-400 text-sm">{error}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {pendingReminders.length === 0 && completedReminders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-base">No reminders found</Text>
            <TouchableOpacity 
              onPress={loadReminders}
              className="mt-4 px-4 py-2 bg-mainPurple rounded-lg"
            >
              <Text className="text-white text-sm">Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {Object.entries(groupedReminders).map(([label, items]) => (
              <View key={label}>
                {/* Dynamic Section Header */}
                <View className="px-6 py-4">
                  <Text className="text-mainPurple text-sm font-medium">{label}</Text>
                </View>

                {items.map(reminder => (
                  <TaskItem
                    key={reminder.id}
                    id={reminder.id}
                    content={reminder.content}
                    parsedTime={reminder.parsed_time}
                    isCompleted={reminder.is_completed}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </View>
            ))}

            {showFinished && completedReminders.length > 0 && (
              <>
                <View className="px-6 py-4">
                  <Text className="text-mainPurple text-sm font-medium">Completed</Text>
                </View>
                {completedReminders.map(reminder => (
                  <TaskItem
                    key={reminder.id}
                    id={reminder.id}
                    content={reminder.content}
                    parsedTime={reminder.parsed_time}
                    isCompleted={reminder.is_completed}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Buttons */}
      <FilterButtons
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        showFinished={showFinished}
        onToggleFinished={() => setShowFinished(!showFinished)}
        type="reminder"
      />
    </View>
  );
}