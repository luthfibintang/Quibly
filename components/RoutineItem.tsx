import { router } from 'expo-router';
import React from 'react';
import { Switch, Text, TouchableOpacity, View } from 'react-native';

// Definisikan tipe untuk props agar lebih aman dan jelas
interface RoutineItemProps {
  routine: {
    // --- PERUBAHAN UTAMA DI SINI ---
    id: string; // ID dari Firebase adalah string, bukan number
    title: string;
    schedule: string;
    isEnabled: boolean;
  };
  // 'onToggle' sekarang hanya perlu dipanggil, tanpa argumen
  onToggle: () => void;
}

const RoutineItem: React.FC<RoutineItemProps> = ({ routine, onToggle }) => {
  const handleEditRoutine = () => {
    // Navigasi sekarang akan menggunakan ID string yang benar dari Firebase
    router.push(`/routines/${routine.id}`);
  };

  return (
    // Container utama untuk setiap item, dengan border dan background gelap
    <TouchableOpacity
      onPress={handleEditRoutine}
      activeOpacity={0.7}
      className="bg-black border-2 border-primary rounded-2xl p-6 mb-4"
    >
      <View className="flex-row justify-between items-center">
        {/* Bagian kiri untuk teks */}
        <View className="flex-1 mr-4">
          {/* Kotak kecil untuk judul */}
          <View className="bg-kindaBlack rounded-md px-3 py-2 self-start mb-2">
            <Text className="text-white text-sm font-semibold">{routine.title}</Text>
          </View>
          {/* Jadwal rutin */}
          <Text className="text-secondary text-sm">{routine.schedule}</Text>
        </View>
        
        {/* Bagian kanan untuk Switch */}
        {/* Kita membungkus Switch dengan TouchableOpacity untuk menghentikan event navigasi,
          saat pengguna hanya ingin menekan switch.
        */}
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation(); // Mencegah navigate ke edit saat toggle switch
            onToggle();
          }}
          activeOpacity={1}
        >
          {/* Switch dibuat tidak bisa diklik langsung (pointerEvents="none")
            karena touch event sudah di-handle oleh TouchableOpacity di atasnya.
          */}
          <Switch
            value={routine.isEnabled}
            trackColor={{ false: '#303030', true: '#7A38F6' }}
            thumbColor={routine.isEnabled ? '#FFFFFF' : '#BFBFBF'} // Warna thumb lebih terang saat disabled
            ios_backgroundColor="#303030"
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
            pointerEvents="none" // Biarkan wrapper TouchableOpacity yang menangani sentuhan
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default RoutineItem;
