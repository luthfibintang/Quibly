import { icons } from '@/constants/icons';
import { QuiblyDB } from '@/services/firebase'; // Sesuaikan path
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Interface untuk FirebaseNote (sesuai dengan yang digunakan di firebase.ts)
interface FirebaseNote {
  id: string;
  content: string;
  created_at: any; // Firebase Timestamp
}

function formatNoteDateLabel(dateString: string | Date): string {
  const targetDate = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const startOfYesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

  if (targetDate >= startOfToday && targetDate < startOfTomorrow) {
    return 'Today';
  } else if (targetDate >= startOfYesterday && targetDate < startOfToday) {
    return 'Yesterday';
  } else {
    return targetDate.toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
    });
  }
}

export default function Notes() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'today' | 'week' | 'month' | 'all'>('today');
  const [notes, setNotes] = useState<FirebaseNote[]>([]);
  const [loading, setLoading] = useState(true);

  // Listen to notes changes from Firebase
  useEffect(() => {
    const unsubscribe = QuiblyDB.listenToNotes((firebaseNotes) => {
      // Convert Firebase timestamp to JavaScript Date
      const processedNotes = firebaseNotes.map(note => ({
        ...note,
        created_at: note.created_at?.toDate ? note.created_at.toDate() : new Date(note.created_at)
      }));
      setNotes(processedNotes);
      setLoading(false);
    });

    // Cleanup listener when component unmounts
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const filteredNotes = useMemo(() => {
    const now = new Date();

    return notes.filter(note => {
      const date = new Date(note.created_at);
      if (activeFilter === 'today') {
        return date.toDateString() === now.toDateString();
      } else if (activeFilter === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo && date <= now;
      } else if (activeFilter === 'month') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      return true; // for 'all'
    });
  }, [notes, activeFilter]);

  const groupedNotes = useMemo(() => {
    const groups: { [label: string]: FirebaseNote[] } = {};
    filteredNotes.forEach(note => {
      const label = formatNoteDateLabel(note.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(note);
    });
    return groups;
  }, [filteredNotes]);

  // Function to handle note deletion
  const handleDeleteNote = (noteId: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await QuiblyDB.deleteNote(noteId);
            } catch (error) {
              console.error('Error deleting note:', error);
              Alert.alert('Error', 'Failed to delete note');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Loading notes...</Text>
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

        <Text className="text-white text-xl font-semibold">Notes</Text>
        <View className="w-6" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {Object.keys(groupedNotes).length === 0 ? (
          <View className="flex-1 justify-center items-center px-6 py-20">
            <Text className="text-gray-400 text-center text-base">
              {activeFilter === 'today' 
                ? "No notes for today"
                : activeFilter === 'week'
                ? "No notes this week"
                : activeFilter === 'month'
                ? "No notes this month"
                : "No notes found"
              }
            </Text>
          </View>
        ) : (
          Object.entries(groupedNotes).map(([label, items]) => (
            <View key={label} className="px-6 py-4">
              <Text className="text-mainPurple text-sm font-medium mb-2">{label}</Text>
              {items.map(note => (
                <TouchableOpacity
                  key={note.id}
                  className="mb-4"
                  onLongPress={() => handleDeleteNote(note.id)}
                  activeOpacity={0.7}
                >
                  <Text className="text-xs text-gray-400 mb-1">
                    {new Date(note.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text className="text-white text-base leading-relaxed">{note.content}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Filter Buttons */}
      <View className="flex-row items-center px-6 py-4 pb-10 bg-black border-t border-kindaBlack">
        {['today', 'week', 'month', 'all'].map(key => (
          <TouchableOpacity
            key={key}
            onPress={() => setActiveFilter(key as any)}
            className={`px-4 py-2 rounded-full mr-3 ${
              activeFilter === key ? 'bg-mainPurple' : 'bg-kindaBlack'
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-sm font-medium ${
                activeFilter === key ? 'text-white' : 'text-gray-400'
              }`}
            >
              {key === 'today'
                ? 'Today'
                : key === 'week'
                ? 'This Week'
                : key === 'month'
                ? 'This Month'
                : 'All'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}