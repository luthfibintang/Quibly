import BubbleChat, { BubbleChatProps } from '@/components/BubbleChat';
import { icons } from '@/constants/icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
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

export default function Index() {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null); // Ganti nama ref
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Welcome to Quibly, your personal memory assistant. Just type anything and I\'ll sort it for you 😊',
      type: 'answer',
      timestamp: '8:45 PM',
    },
    {
      id: '2',
      message: 'Task go to To-Dos, notes stay as Notes, reminders will notify you ✅',
      type: 'answer',
      timestamp: '8:45 PM',
    },
    {
      id: '3',
      message: 'Reminds me to study tomorrow at 4PM.',
      type: 'sender',
      timestamp: '8:46 PM',
    },
    {
      id: '4',
      message: "Ok, I'll Reminds you to study tomorrow at 4PM.",
      type: 'answer',
      timestamp: '8:46 PM',
    },
  ]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputText.trim(),
      type: 'sender',
      timestamp: new Date().toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      }),
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(inputText.trim());
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: response,
        type: 'answer',
        timestamp: new Date().toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        }),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    // Check for reminders
    if (lowerInput.includes('remind') || lowerInput.includes('ingatkan')) {
      return `Baik, saya akan mengingatkan Anda. Pengingat telah dibuat! ⏰`;
    }
    
    // Check for tasks/to-do
    if (lowerInput.includes('task') || lowerInput.includes('to do') || lowerInput.includes('harus')) {
      return `Tugas telah ditambahkan ke daftar To-Do Anda! ✅`;
    }
    
    // Check for notes
    if (lowerInput.includes('note') || lowerInput.includes('catat') || lowerInput.includes('ingat')) {
      return `Catatan telah disimpan! Saya akan mengingatnya untuk Anda 📝`;
    }
    
    // Default response
    return `Saya telah mencatat pesan Anda dan mengkategorikannya dengan tepat! 👍`;
  };

  return (
    <KeyboardAvoidingView 
      className="flex-1 bg-black"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 83 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <BubbleChat
            message={item.message}
            type={item.type}
            timestamp={item.timestamp}
            showTimestamp={true}
          />
        )}
        ListFooterComponent={
          <View className="items-center py-2">
            <Text className="text-gray-400 text-sm">Today</Text>
          </View>
        }
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        inverted={true}
        onContentSizeChange={() => {
          // Untuk inverted list, scroll ke offset 0 (bottom/terbaru)
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }}
      />

      {/* Input Area */}
      <View 
        className="flex-row items-center px-4 py-2 bg-black"
        style={{ 
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 12 : 12,
          marginBottom: Platform.OS === 'android' ? keyboardHeight : 0
        }}
      >
        {/* Add Button */}
        <TouchableOpacity className="mr-3">
          <View className="w-10 h-10 bg-kindaBlack rounded-full items-center justify-center">
            <Text className="text-white text-lg font-light">+</Text>
          </View>
        </TouchableOpacity>

        {/* Text Input */}
        <View className="flex-1 flex-row items-center bg-gray-800 rounded-3xl px-4 py-1 pb-3">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor="#969696"
            className="flex-1 text-white text-base"
            multiline={true}
            maxLength={500}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
            numberOfLines={3}
          />
        </View>

        {/* Send Button */}
        <TouchableOpacity 
          onPress={handleSendMessage}
          className="ml-3"
          disabled={inputText.trim() === ''}
        >
          <View className={`w-10 h-10 rounded-full items-center justify-center ${
            inputText.trim() === '' ? 'bg-kindaBlack' : 'bg-mainPurple'
          }`}>
            <View className="w-5 h-5">
              {/* <Text className="text-white text-sm">→</Text> */}
              <Image
                source={icons.sendText}
                className='w-5 h-5'
                tintColor="#ffffff"
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}