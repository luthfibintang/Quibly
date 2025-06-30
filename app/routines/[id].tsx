import { icons } from '@/constants/icons';
import { QuiblyDB } from '@/services/firebase'; // <-- IMPOR QuiblyDB
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Komponen DayButton
const DayButton = ({ day, isSelected, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full mr-2 mb-2 ${isSelected ? 'bg-mainPurple' : 'bg-primary'}`}
    activeOpacity={0.8}
  >
    <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{day}</Text>
  </TouchableOpacity>
);


export default function EditRoutine() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // --- State untuk Form ---
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Everyday'];

  // --- State Management untuk Date Pickers ---
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());

  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

  // --- Mengambil & Menginisialisasi Data dari Firebase ---
  useEffect(() => {
    if (!id) return;

    const fetchRoutine = async () => {
      try {
        const routineData = await QuiblyDB.getRoutineById(id);
        if (routineData) {
          // Isi semua state form dengan data dari Firebase
          setMessage(routineData.message);
          setStartDate(routineData.startDate);
          setEndDate(routineData.endDate);
          setSelectedDays(routineData.selectedDays);
        } else {
          Alert.alert('Error', 'Routine not found.', [{ text: 'OK', onPress: () => router.back() }]);
        }
      } catch (error) {
        console.error("Failed to fetch routine:", error);
        Alert.alert('Error', 'Could not load routine data.');
        router.back();
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutine();
  }, [id]);

  // --- Fungsi-fungsi untuk Date Picker (tidak berubah) ---
  const handleOpenStartDatePicker = () => { setTempStartDate(startDate); setShowStartDatePicker(true); };
  const handleOpenEndDatePicker = () => { setTempEndDate(endDate || startDate); setShowEndDatePicker(true); };
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      if (showStartDatePicker) setTempStartDate(selectedDate);
      else if (showEndDatePicker) setTempEndDate(selectedDate);
    }
  };
  const confirmStartDate = () => { setStartDate(tempStartDate); if (endDate && tempStartDate > endDate) setEndDate(null); setShowStartDatePicker(false); };
  const confirmEndDate = () => { setEndDate(tempEndDate); setShowEndDatePicker(false); };
  const clearEndDate = () => { setEndDate(null); setShowEndDatePicker(false); };
  const closeModal = () => { setShowStartDatePicker(false); setShowEndDatePicker(false); };
  const formatDisplayDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // --- Fungsi Handle Aksi (terhubung ke Firebase) ---
  const handleDayPress = (day: string) => {
    if (day === 'Everyday') setSelectedDays(selectedDays.includes('Everyday') ? [] : ['Everyday']);
    else {
      let newDays = selectedDays.filter(d => d !== 'Everyday');
      if (newDays.includes(day)) newDays = newDays.filter(d => d !== day);
      else newDays.push(day);
      setSelectedDays(newDays);
    }
  };
  
  const handleSaveRoutine = async () => {
    if (!id) return;
    if (!message.trim()) {
      Alert.alert('Error', 'Message cannot be empty.');
      return;
    }

    try {
      const updatedData = { message, startDate, endDate, selectedDays };
      await QuiblyDB.updateRoutine(id, updatedData);
      Alert.alert('Success', 'Routine updated successfully!', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes.');
    }
  };
  
  const handleDeleteRoutine = () => {
    if (!id) return;
    Alert.alert(
      'Delete Routine',
      'Are you sure you want to delete this routine? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await QuiblyDB.deleteRoutine(id);
              Alert.alert('Success', 'Routine has been deleted.', [{ text: 'OK', onPress: () => router.back() }]);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete routine.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return <View className="flex-1 bg-black justify-center items-center"><ActivityIndicator size="large" color="#8B5CF6" /></View>;
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4" style={{ paddingTop: insets.top + 16 }}>
        <TouchableOpacity onPress={() => router.back()}><Image source={icons.left} className="w-8 h-8" style={{ tintColor: '#ffffff' }} /></TouchableOpacity>
        <Text className="text-white text-xl font-semibold">Edit Routine</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-6 pt-10" contentContainerStyle={{ paddingBottom: 50 }}>
        {/* Input & Date Selection */}
        <View className="mb-6"><TextInput value={message} onChangeText={setMessage} placeholder="Message" multiline className="bg-primary rounded-lg p-4 text-white text-base" /></View>
        <View className="mb-6 bg-primary rounded-lg">
          <TouchableOpacity onPress={handleOpenStartDatePicker} className="p-4 flex-row items-center justify-between border-b border-gray-700">
            <Text className="text-white text-base">Time to Send</Text>
            <View className="flex-row items-center"><Text className="text-gray-300 mr-2">{formatDisplayDate(startDate)}</Text><Ionicons name="chevron-forward" size={20} color="#6B7280" /></View>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleOpenEndDatePicker} className="p-4 flex-row items-center justify-between">
            <Text className="text-white text-base">End Date</Text>
            <View className="flex-row items-center"><Text className="text-gray-300 mr-2">{formatDisplayDate(endDate)}</Text><Ionicons name="chevron-forward" size={20} color="#6B7280" /></View>
          </TouchableOpacity>
        </View>
        
        {/* Day Selection */}
        <View className="mb-8">
          <Text className="text-white text-base mb-4">Every:</Text>
          <View className="flex-row flex-wrap">{days.map(day => <DayButton key={day} day={day} isSelected={selectedDays.includes(day)} onPress={() => handleDayPress(day)} />)}</View>
        </View>

        {/* Action Buttons */}
        <View className="mb-8">
          <TouchableOpacity onPress={handleSaveRoutine} className="bg-mainPurple rounded-full py-4 px-6 mb-4"><Text className="text-white text-center font-semibold text-base">Save Routine</Text></TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteRoutine} className="bg-red-700 rounded-full py-4 px-6"><Text className="text-white text-center font-semibold text-base">Delete Routine</Text></TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- MODAL UNTUK DATE PICKER --- */}
      <Modal transparent animationType="slide" visible={showStartDatePicker || showEndDatePicker} onRequestClose={closeModal}>
        <Pressable onPress={closeModal} className="flex-1 justify-end bg-black/50">
          <Pressable className="bg-black rounded-t-2xl" style={{ paddingBottom: insets.bottom }}>
            <View className="flex-row justify-between items-center p-4 bg-black">
              <TouchableOpacity onPress={closeModal}><Text className="text-mainPurple text-lg">Cancel</Text></TouchableOpacity>
              <Text className="text-white font-bold text-lg">{showStartDatePicker ? 'Time to Send' : 'End Date'}</Text>
              <TouchableOpacity onPress={showStartDatePicker ? confirmStartDate : confirmEndDate}><Text className="text-mainPurple text-lg font-bold">Confirm</Text></TouchableOpacity>
            </View>
            {showEndDatePicker && <TouchableOpacity onPress={clearEndDate} className="items-center py-3 border-b bg-black border-gray-700"><Text className="text-red-500 text-lg">Set to Never</Text></TouchableOpacity>}
            <View className="p-2 bg-black">
              {showStartDatePicker && <DateTimePicker mode="datetime" display="spinner" value={tempStartDate} onChange={handleDateChange} textColor="white" />}
              {showEndDatePicker && <DateTimePicker mode="datetime" display="spinner" value={tempEndDate} onChange={handleDateChange} textColor="white" minimumDate={startDate} />}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}