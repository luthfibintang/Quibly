import React from 'react';
import { Text, View } from 'react-native';

export interface BubbleChatProps {
  message: string;
  type: 'sender' | 'answer';
  timestamp?: string;
  showTimestamp?: boolean;
}

export default function BubbleChat({ 
  message, 
  type, 
  timestamp, 
  showTimestamp = true 
}: BubbleChatProps) {
  const isSender = type === 'sender';
  
  return (
    <View className={`mb-2 ${isSender ? 'items-end' : 'items-start'}`}>
      <View
        className={`max-w-[80%] px-4 py-3 rounded-2xl ${
          isSender 
            ? 'bg-kindaBlack rounded-br-md' 
            : 'bg-mainPurple rounded-bl-md'
        }`}
      >
        <Text className="text-white text-base leading-5">
          {message}
        </Text>
      </View>
      
      {showTimestamp && timestamp && (
        <Text className="text-gray-400 text-xs mt-1 px-2">
          {timestamp}
        </Text>
      )}
    </View>
  );
}