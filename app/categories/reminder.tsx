import FilterButtons from '@/components/FilterButtons';
import TaskItem from '@/components/TaskItem';
import { icons } from '@/constants/icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ReminderItem {
  id: string;
  content: string;
  category: string;
  created_at: string;
  parsed_time: string;
  is_completed: boolean;
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

  const [reminders, setReminders] = useState<ReminderItem[]>([
    {
      id: '1',
      content: 'Water the plants',
      category: 'reminder',
      created_at: '2025-06-28T19:00:00+07:00',
      parsed_time: '2025-06-28T08:00:00+07:00',
      is_completed: true,
    },
    {
      id: '2',
      content: 'Study',
      category: 'reminder',
      created_at: '2025-06-28T19:00:00+07:00',
      parsed_time: '2025-06-28T10:00:00+07:00',
      is_completed: true,
    },
    {
      id: '3',
      content: 'Study',
      category: 'reminder',
      created_at: '2025-06-28T19:00:00+07:00',
      parsed_time: '2025-06-28T13:00:00+07:00',
      is_completed: false,
    },
    {
      id: '4',
      content: 'Get ready for a sleep',
      category: 'reminder',
      created_at: '2025-06-28T19:00:00+07:00',
      parsed_time: '2025-06-28T22:00:00+07:00',
      is_completed: false,
    },
    {
      id: '5',
      content: 'Morning jog',
      category: 'reminder',
      created_at: '2025-06-28T19:00:00+07:00',
      parsed_time: '2025-06-29T06:00:00+07:00',
      is_completed: false,
    },
    {
      id: '6',
      content: 'Team meeting',
      category: 'reminder',
      created_at: '2025-06-28T19:00:00+07:00',
      parsed_time: '2025-06-30T14:00:00+07:00',
      is_completed: false,
    },
    {
      id: '7',
      content: 'Client Presentation',
      category: 'reminder',
      created_at: '2025-06-26T20:00:00+07:00',
      parsed_time: '2025-06-27T14:00:00+07:00',
      is_completed: false,
    },
    {
      id: '8',
      content: 'Project Deadline',
      category: 'reminder',
      created_at: '2025-06-01T10:00:00+07:00',
      parsed_time: '2025-06-26T14:00:00+07:00',
      is_completed: false,
    },
  ]);

  const handleToggleComplete = (id: string) => {
    setReminders(prev =>
      prev.map(reminder =>
        reminder.id === id
          ? { ...reminder, is_completed: !reminder.is_completed }
          : reminder
      )
    );
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

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {pendingReminders.length === 0 && completedReminders.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-base">No reminders found</Text>
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