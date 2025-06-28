import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface TaskItemProps {
  id: string;
  content: string;
  parsedTime?: string;
  isCompleted: boolean;
  onToggleComplete: (id: string) => void;
}

export default function TaskItem({ 
  id, 
  content, 
  parsedTime, 
  isCompleted, 
  onToggleComplete 
}: TaskItemProps) {

  function formatReminder(dateString: string): string {
  const targetDate = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfDayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  // Format jam
  const timeString = targetDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    // hour12: true,
  });

  let dateLabel = targetDate.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
  });

  if (targetDate >= startOfToday && targetDate < startOfTomorrow) {
    dateLabel = 'Today';
  } else if (targetDate >= startOfTomorrow && targetDate < startOfDayAfterTomorrow) {
    dateLabel = 'Tomorrow';
  } else if (targetDate >= startOfYesterday && targetDate < startOfToday) {
    dateLabel = 'Yesterday';
  }

  return `${dateLabel} at ${timeString}`;
  }

  return (
    <TouchableOpacity
      onPress={() => onToggleComplete(id)}
      className="flex-row items-center px-6 py-4"
      activeOpacity={0.7}
    >
      {/* Checkbox */}
      <View 
        className={`w-6 h-6 rounded-md border-2 mr-4 items-center justify-center ${
          isCompleted 
            ? 'bg-mainPurple border-mainPurple' 
            : 'border-gray-500 bg-transparent'
        }`}
      >
        {isCompleted && (
          <Text className="text-white text-sm font-bold">✓</Text>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text 
          className={`text-base ${
            isCompleted 
              ? 'text-gray-500 line-through' 
              : 'text-white'
          }`}
        >
          {content}
        </Text>
        {parsedTime && (
          <Text 
            className={`text-sm mt-1 ${
              isCompleted ? 'text-gray-600' : 'text-gray-400'
            }`}
          >
            {formatReminder(parsedTime)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}