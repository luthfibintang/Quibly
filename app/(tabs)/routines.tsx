// Ganti seluruh isi file: routines.tsx

import RoutineItem from '@/components/RoutineItem'; // Pastikan path ini benar
import { QuiblyDB } from '@/services/firebase'; // Impor QuiblyDB
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Definisikan tipe Routine untuk state di komponen ini
// Kita butuh ini karena 'startDate', dll. adalah Date, bukan Timestamp Firebase
interface Routine {
  id: string;
  title?: string; // Judul bisa diambil dari message
  message: string;
  schedule: string; // Kita akan generate schedule string
  isEnabled: boolean;
}

// Fungsi helper untuk membuat string jadwal yang dinamis
const generateScheduleString = (routine: any): string => {
    const time = routine.startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit'});
    const days = routine.selectedDays.join(', ');
    return `${days} at ${time}`;
}

export default function Routines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();

  // useEffect untuk listen ke data dari Firebase
  useEffect(() => {
    const unsubscribe = QuiblyDB.listenToRoutines((firebaseRoutines) => {
      // Ubah data dari Firebase menjadi format yang bisa ditampilkan di UI
      const formattedRoutines = firebaseRoutines.map(routine => ({
        id: routine.id,
        title: routine.message, // Gunakan message sebagai judul
        message: routine.message,
        schedule: generateScheduleString(routine), // Generate schedule string
        isEnabled: routine.isEnabled,
      }));
      setRoutines(formattedRoutines);
      setIsLoading(false);
    });

    // Cleanup listener saat komponen di-unmount
    return () => unsubscribe();
  }, []);

  const handleToggleRoutine = async (routineId: string, currentStatus: boolean) => {
    try {
      // Panggil fungsi update di Firebase
      await QuiblyDB.updateRoutineStatus(routineId, !currentStatus);
      // State akan otomatis terupdate oleh listener, tidak perlu `setRoutines` manual
    } catch (error) {
      console.error("Failed to update routine status:", error);
      Alert.alert('Error', 'Failed to update routine.');
    }
  };

  const handleCreateRoutine = () => {
    router.push('/routines/createRoutines'); 
  };
  
  const handleEditRoutine = (routineId: string) => {
    router.push(`/routines/${routineId}`);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text className="text-white mt-4">Loading Routines...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black py-4">
      <ScrollView 
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Konten */}
        <View className="my-6">
          <Text className="text-white text-3xl font-bold mb-2">Routines</Text>
          <Text className="text-gray-400 text-base leading-6 mb-6">
            Routines are messages which are sent periodically to you
          </Text>
          <TouchableOpacity onPress={handleCreateRoutine} className="bg-mainPurple rounded-full py-3 self-start px-5" activeOpacity={0.8}>
            <Text className="text-white text-base font-bold">New Routine</Text>
          </TouchableOpacity>
        </View>

        {/* Daftar Routines */}
        {routines.length > 0 ? (
          <View>
            {routines.map(routine => (
              <TouchableOpacity key={routine.id} onPress={() => handleEditRoutine(routine.id)} activeOpacity={0.7}>
                <RoutineItem
                  routine={routine}
                  onToggle={() => handleToggleRoutine(routine.id, routine.isEnabled)}
                />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="items-center justify-center py-20">
            <Text className="text-gray-400 text-lg text-center">No routines found.</Text>
            <Text className="text-gray-500 text-center mt-2">Tap "New Routine" to get started.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}