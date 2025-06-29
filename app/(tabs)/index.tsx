import BubbleChat, { BubbleChatProps } from '@/components/BubbleChat';
import { icons } from '@/constants/icons';
import { useReminder } from '@/hooks/useReminder';
import { QuiblyDB } from '@/services/firebase'; // Import QuiblyDB
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { SectionList } from 'react-native';

import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');

interface ChatMessage extends BubbleChatProps {
  id: string;
}

// Interface untuk data message dari Firebase
interface FirebaseMessage {
  id?: string;
  text?: string;
  message?: string;
  type?: string;
  timestamp?: any; // Firebase timestamp bisa berupa Timestamp atau string
  createdAt?: any;
}

// Types untuk parsing
interface ParseResult {
  type: 'reminder' | 'todo' | 'note';
  cleanContent: string; // Content yang sudah dibersihkan
  parsedTime?: Date; // Untuk reminder
  dueDate?: Date; // Untuk todo
  originalMessage: string; // Pesan asli
}

// Fungsi untuk membersihkan content dari kata-kata instruksi
const cleanContent = (message: string, type: 'reminder' | 'todo' | 'note'): string => {
  let cleaned = message.trim();
  
  if (type === 'reminder') {
    // Hapus kata-kata instruksi reminder
    cleaned = cleaned.replace(/^(ingatkan|reminder|ingat)\s+(saya|aku|ku)?\s*(untuk)?\s*/i, '');
    cleaned = cleaned.replace(/\bdalam\s+\d+\s*(menit|jam)\b/gi, '');
    cleaned = cleaned.replace(/\b(besok|hari ini|lusa|minggu depan)\b/gi, '');
    cleaned = cleaned.replace(/\b(jam|pukul)\s+\d{1,2}(:\d{2})?\s*(pagi|siang|sore|malam|am|pm)?\b/gi, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    cleaned = cleaned.trim();
  } else if (type === 'todo') {
    // Hapus kata-kata instruksi todo
    cleaned = cleaned.replace(/^(saya akan|saya ingin|aku akan|aku ingin|harus|perlu|wajib)\s+/i, '');
    cleaned = cleaned.replace(/\s+(deadline|batas|sampai|hingga)\s+(tanggal\s*)?\d{1,2}/i, '');
    cleaned = cleaned.replace(/\s+(selesai|finish)\s+(tanggal\s*)?\d{1,2}/i, '');
    cleaned = cleaned.replace(/\s+(besok|minggu ini|hari ini)/i, '');
    cleaned = cleaned.trim();
  }
  
  // Kapitalisasi huruf pertama
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  return cleaned || message.trim(); // Fallback ke pesan asli jika kosong
};

// Fungsi parsing waktu yang lebih canggih
const parseTimeFromMessage = (message: string): Date | null => {
  const text = message.toLowerCase();
  const now = new Date();
  let targetDate = new Date(now);

  // ⏱ Tambahkan support untuk waktu relatif "dalam X menit/jam"
  const relativeTimeMatch = text.match(/dalam\s+(\d+)\s*(menit|jam)/i);
  if (relativeTimeMatch) {
    const amount = parseInt(relativeTimeMatch[1]);
    const unit = relativeTimeMatch[2];

    if (unit.includes('menit')) {
      targetDate.setMinutes(targetDate.getMinutes() + amount);
    } else if (unit.includes('jam')) {
      targetDate.setHours(targetDate.getHours() + amount);
    }

    return targetDate;
  }

  // ...lanjutan pattern jam seperti sebelumnya
  const timePatterns = [
    /(?:jam|pukul)\s*(\d{1,2})(?::(\d{2}))?\s*(pagi|siang|sore|malam)?/i,
    /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i,
    /(\d{1,2})\s*(pagi|siang|sore|malam)/i
  ];

  let timeFound = false;
  let hour = 9;
  let minute = 0;

  for (let pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      hour = parseInt(match[1]);
      minute = match[2] ? parseInt(match[2]) : 0;
      const period = match[3]?.toLowerCase();

      if (period === 'malam' && hour < 12) hour += 12;
      if (period === 'sore' && hour < 17) hour += 12;
      if (period === 'pm' && hour < 12) hour += 12;
      if ((period === 'pagi' || period === 'am') && hour === 12) hour = 0;

      timeFound = true;
      break;
    }
  }

  if (text.includes('besok')) {
    targetDate.setDate(targetDate.getDate() + 1);
  } else if (text.includes('lusa')) {
    targetDate.setDate(targetDate.getDate() + 2);
  } else if (text.includes('minggu depan')) {
    targetDate.setDate(targetDate.getDate() + 7);
  }

  if (timeFound) {
    targetDate.setHours(hour, minute, 0, 0);

    if (!text.includes('besok') && !text.includes('lusa') && !text.includes('minggu') && targetDate <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }

    return targetDate;
  }

  return null;
};

// Fungsi parsing due date untuk todo
const parseDueDateFromMessage = (message: string): Date | null => {
  const text = message.toLowerCase();
  const now = new Date();
  
  // Pattern untuk deadline
  const dueDatePatterns = [
    /(?:deadline|batas|sampai|hingga)\s*(?:tanggal\s*)?(\d{1,2})/i,
    /(?:selesai|finish)\s*(?:tanggal\s*)?(\d{1,2})/i
  ];

  for (let pattern of dueDatePatterns) {
    const match = text.match(pattern);
    if (match) {
      const day = parseInt(match[1]);
      const dueDate = new Date(now);
      dueDate.setDate(day);
      dueDate.setHours(23, 59, 59, 999); // End of day
      
      // Jika tanggal sudah lewat bulan ini, set ke bulan depan
      if (dueDate <= now) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      return dueDate;
    }
  }

  // Pattern untuk hari relatif
  if (text.includes('besok')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    return tomorrow;
  }

  if (text.includes('minggu ini')) {
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  }

  return null;
};

// Fungsi parsing pesan utama
const parseMessage = (message: string): ParseResult => {
  const text = message.toLowerCase().trim();
  
  // Pattern untuk reminder
  const reminderPatterns = [
    /ingatkan/i,
    /reminder/i,
    /ingat.*untuk/i
  ];
  
  // Pattern untuk todo
  const todoPatterns = [
    /saya akan/i,
    /saya ingin/i,
    /aku akan/i,
    /aku ingin/i,
    /harus/i,
    /perlu/i,
    /wajib/i,
    /todo/i,
    /tugas/i
  ];

  // Check for reminders
  for (let pattern of reminderPatterns) {
    if (pattern.test(text)) {
      const parsedTime = parseTimeFromMessage(message);
      const cleanedContent = cleanContent(message, 'reminder');
      return {
        type: 'reminder',
        cleanContent: cleanedContent,
        parsedTime: parsedTime || new Date(Date.now() + 60 * 60 * 1000), // Default 1 jam dari sekarang
        originalMessage: message
      };
    }
  }

  // Check for todos
  for (let pattern of todoPatterns) {
    if (pattern.test(text)) {
      const dueDate = parseDueDateFromMessage(message);
      const cleanedContent = cleanContent(message, 'todo');
      return {
        type: 'todo',
        cleanContent: cleanedContent,
        dueDate: dueDate,
        originalMessage: message
      };
    }
  }

  // Default to notes
  return {
    type: 'note',
    cleanContent: cleanContent(message, 'note'),
    originalMessage: message
  };
};

// Generate response berdasarkan tipe - HANYA KONFIRMASI untuk reminder
const generateResponse = (parseResult: ParseResult): string => {
  switch (parseResult.type) {
    case 'reminder':
      if (parseResult.parsedTime) {
        const reminderDate = parseResult.parsedTime;
        const timeStr = reminderDate.toLocaleString('id-ID', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
        return `Baik, saya akan mengingatkan kamu pada ${timeStr} untuk ${parseResult.cleanContent.toLowerCase()} ⏰`;
      } else {
        return `Pengingat telah disimpan untuk ${parseResult.cleanContent.toLowerCase()} ⏰`;
      }
    case 'todo':
      if (parseResult.dueDate) {
        const dueDate = parseResult.dueDate;
        const dateStr = dueDate.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        return `Tugas "${parseResult.cleanContent}" ditambahkan dengan deadline ${dateStr} ✅`;
      } else {
        return `Tugas "${parseResult.cleanContent}" ditambahkan ke daftar To-Do ✅`;
      }
    default:
      return `Catatan "${parseResult.cleanContent}" telah disimpan 📝`;
  }
};

function formatMessageDateLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
  }
}

export default function Index() {
  const insets = useSafeAreaInsets();
  const sectionListRef = useRef<SectionList>(null);
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const { checkReminders } = useReminder();

  useEffect(() => {
    const unsubscribe = QuiblyDB.listenToMessages((newMessages) => {
      const chatMessages: ChatMessage[] = newMessages.map((msg: FirebaseMessage, index: number) => {
        let date = new Date();
        if (msg.timestamp) {
          try {
            if (typeof msg.timestamp === 'string') {
              date = new Date(msg.timestamp);
            } else if (msg.timestamp.toDate) {
              date = msg.timestamp.toDate();
            } else if (msg.timestamp.seconds) {
              date = new Date(msg.timestamp.seconds * 1000);
            }
          } catch {
            date = new Date();
          }
        }

        return {
          id: msg.id || `msg-${index}-${Date.now()}`,
          message: msg.text || msg.message || '',
          type: msg.type === 'sender' ? 'sender' : 'answer',
          timestamp: date.toLocaleTimeString('id-ID', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
          }),
          rawDate: date
        };
      });

      setMessages(chatMessages);
      setIsLoadingHistory(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const groupedMessages = useMemo(() => {
    const groups: { [label: string]: ChatMessage[] } = {};
    messages.forEach((msg) => {
      const label = formatMessageDateLabel(msg.rawDate);
      if (!groups[label]) groups[label] = [];
      groups[label].push(msg);
    });

    return Object.entries(groups)
      .map(([title, data]) => ({
        title,
        data: data.reverse()
      }))
      .reverse();
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputText.trim() === '' || isLoading) return;

    const userMessage = inputText.trim();
    setIsLoading(true);

    const now = new Date();
    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      message: userMessage,
      type: 'sender',
      timestamp: now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false }),
      rawDate: now
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputText('');

    try {
      const parseResult = parseMessage(userMessage);
      switch (parseResult.type) {
        case 'reminder':
          await QuiblyDB.addReminder(parseResult.cleanContent, parseResult.parsedTime!);
          break;
        case 'todo':
          await QuiblyDB.addTodo(parseResult.cleanContent, parseResult.dueDate?.toISOString());
          break;
        default:
          await QuiblyDB.addNote(parseResult.cleanContent);
          break;
      }

      await QuiblyDB.addMessage(userMessage, 'sender');

      const systemResponse = generateResponse(parseResult);
      await QuiblyDB.addMessage(systemResponse, 'answer');

    } catch (err) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        type: 'answer',
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }),
        rawDate: new Date()
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingHistory) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-base">Loading chat history...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 83 : 0}
    >
      <SectionList
        ref={sectionListRef}
        sections={groupedMessages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BubbleChat
            message={item.message}
            type={item.type}
            timestamp={item.timestamp}
            showTimestamp={true}
          />
        )}
        renderSectionFooter={({ section: { title } }) => (
          <View className="items-center pb-4">
            <Text className="text-gray-400 text-sm">{title}</Text>
          </View>
        )}
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        inverted
      />

      <View
        className="flex-row items-center px-4 py-2 bg-black"
        style={{
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 12 : 12,
          marginBottom: Platform.OS === 'android' ? keyboardHeight : 0
        }}
      >
        <TouchableOpacity className="mr-3">
          <View className="w-10 h-10 bg-kindaBlack rounded-full items-center justify-center">
            <Text className="text-white text-lg font-light">+</Text>
          </View>
        </TouchableOpacity>

        <View className="flex-1 flex-row items-center bg-kindaBlack rounded-3xl px-4 py-1 pb-3">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#969696"
            className="flex-1 text-white text-base"
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            numberOfLines={3}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          onPress={handleSendMessage}
          className="ml-3"
          disabled={inputText.trim() === '' || isLoading}
        >
          <View className={`w-10 h-10 rounded-full items-center justify-center ${
            inputText.trim() === '' || isLoading ? 'bg-kindaBlack' : 'bg-mainPurple'
          }`}>
            <View className="w-5 h-5">
              {isLoading ? (
                <Text className="text-white text-xs">...</Text>
              ) : (
                <Image
                  source={icons.sendText}
                  className="w-5 h-5"
                  tintColor="#ffffff"
                  resizeMode="contain"
                />
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}