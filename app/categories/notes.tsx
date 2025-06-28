import { icons } from '@/constants/icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface NoteItem {
  id: string;
  content: string;
  created_at: string;
}

function formatNoteDateLabel(dateString: string): string {
  const targetDate = new Date(dateString);
  const now = new Date();

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  // const startOfDayAfterTomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);
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

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: '1',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      created_at: '2025-06-28T17:01:00+07:00',
    },
    {
      id: '2',
      content: 'Bro ipsum dolor sit amet whistler washboard pipe first tracks gaper, presta dirtbag rail air free ride gondy piste dust on crust smear snake bite.',
      created_at: '2025-06-28T14:32:00+07:00',
    },
    {
      id: '3',
      content: 'Schwag pov huck apres. Bail DH liftie rail single track.',
      created_at: '2025-06-28T10:21:00+07:00',
    },
    {
      id: '4',
      content: 'Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat.',
      created_at: '2025-06-27T19:04:00+07:00',
    },
    {
      id: '5',
      content: 'Saddle butter hardtail Bike ACL white room huck, presta ollie shuttle gapers couloir park over the bars.',
      created_at: '2025-06-27T18:50:00+07:00',
    },
    {
      id: '6',
      content: 'Meeting summary: Review roadmap, assign tasks to devs, update documentation, and finalize Q3 objectives.',
      created_at: '2025-06-25T11:15:00+07:00',
    },
    {
      id: '7',
      content: 'Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat.',
      created_at: '2025-05-25T11:15:00+07:00',
    },
    {
      id: '8',
      content: 'Meeting summary: Review roadmap, assign tasks to devs, update documentation, and finalize Q3 objectives. Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat. Ut enim ad minim  veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea  commodo consequat.',
      created_at: '2025-05-25T11:15:00+07:00',
    },
  ]);

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
    const groups: { [label: string]: NoteItem[] } = {};
    filteredNotes.forEach(note => {
      const label = formatNoteDateLabel(note.created_at);
      if (!groups[label]) groups[label] = [];
      groups[label].push(note);
    });
    return groups;
  }, [filteredNotes]);

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
        {Object.entries(groupedNotes).map(([label, items]) => (
          <View key={label} className="px-6 py-4">
            <Text className="text-mainPurple text-sm font-medium mb-2">{label}</Text>
            {items.map(note => (
              <View key={note.id} className="mb-4">
                <Text className="text-xs text-gray-400 mb-1">
                  {new Date(note.created_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                <Text className="text-white text-base leading-relaxed">{note.content}</Text>
              </View>
            ))}
          </View>
        ))}
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