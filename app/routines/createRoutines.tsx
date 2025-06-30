import { icons } from '@/constants/icons';
import { QuiblyDB } from '@/services/firebase'; // Import fungsi dari Firebase
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Komponen DayButton (tidak ada perubahan)
const DayButton = ({ day, isSelected, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    className={`px-4 py-2 rounded-full mr-2 mb-2 ${isSelected ? 'bg-mainPurple' : 'bg-primary'}`}
  >
    <Text className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-300'}`}>{day}</Text>
  </TouchableOpacity>
);

export default function CreateRoutines() {
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [selectedDays, setSelectedDays] = useState(['Everyday']);
  const days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Everyday'];

  // --- State Management untuk Date Pickers ---

  // 1. Start Date (Time to Send)
  const [startDate, setStartDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(new Date());

  // 2. End Date
  const [endDate, setEndDate] = useState<Date | null>(null); // null berarti "Never"
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [tempEndDate, setTempEndDate] = useState<Date>(new Date());

  // --- Fungsi-fungsi untuk Date Picker ---

  const handleOpenStartDatePicker = () => {
    setTempStartDate(startDate); // Atur tanggal sementara saat picker dibuka
    setShowStartDatePicker(true);
  };

  const handleOpenEndDatePicker = () => {
    // Jika end date belum diatur, default ke start date. Jika sudah, gunakan end date.
    setTempEndDate(endDate || startDate);
    setShowEndDatePicker(true);
  };
  
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (selectedDate) {
      if (showStartDatePicker) {
        setTempStartDate(selectedDate);
      } else if (showEndDatePicker) {
        setTempEndDate(selectedDate);
      }
    }
  };

  const confirmStartDate = () => {
    setStartDate(tempStartDate);
    // Jika start date yang baru lebih lambat dari end date, reset end date
    if (endDate && tempStartDate > endDate) {
        setEndDate(null);
    }
    setShowStartDatePicker(false);
  };
  
  const confirmEndDate = () => {
    setEndDate(tempEndDate);
    setShowEndDatePicker(false);
  };
  
  const clearEndDate = () => {
    setEndDate(null); // Atur ke null untuk "Never"
    setShowEndDatePicker(false);
  };

  const closeModal = () => {
    setShowStartDatePicker(false);
    setShowEndDatePicker(false);
  };
  
  // --- Format Tanggal untuk Tampilan ---
  const formatDisplayDate = (date: Date | null) => {
    if (!date) return 'Never';
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' }) + ', ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  // ... fungsi handleCreateRoutine dan lainnya ...
  const handleCreateRoutine = async () => {
      if (!message.trim()) {
        Alert.alert('Error', 'Please enter a message for your routine');
        return;
      }
      if (selectedDays.length === 0) {
          Alert.alert('Error', 'Please select at least one day');
          return;
      }

      try {
        // Siapkan data untuk dikirim ke Firebase
        const newRoutine = {
          message,
          startDate,
          endDate,
          selectedDays,
        };

        // Panggil fungsi dari firebase.ts
        await QuiblyDB.addRoutine(newRoutine);

        Alert.alert('Success', 'Routine created successfully!', [
          { text: 'OK', onPress: () => router.back() },
        ]);

      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to create routine. Please try again.');
      }
  };
  
  const handleDayPress = (day: string) => {
    // (logika tidak berubah)
    if (day === 'Everyday') {
      if (selectedDays.includes('Everyday')) {
        setSelectedDays([]);
      } else {
        setSelectedDays(['Everyday']);
      }
    } else {
      if (selectedDays.includes('Everyday')) {
        setSelectedDays([day]);
      } else {
        if (selectedDays.includes(day)) {
          setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
          setSelectedDays([...selectedDays, day]);
        }
      }
    }
  };

  const minEndDate = new Date(startDate);
  minEndDate.setDate(minEndDate.getDate() + 1);

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4" style={{ paddingTop: insets.top + 16 }}>
        <TouchableOpacity onPress={() => router.back()}>
          <Image source={icons.left} className="w-8 h-8" style={{ tintColor: '#ffffff' }} />
        </TouchableOpacity>
        <Text className="text-white text-xl font-semibold">Create Routine</Text>
        <View className="w-6" />
      </View>

      <ScrollView className="flex-1 px-6 pt-10">
        {/* Message Input */}
        <View className="mb-6">
          <TextInput
            value={message} onChangeText={setMessage} placeholder="Message" placeholderTextColor="#969696"
            multiline numberOfLines={4} className="bg-primary rounded-lg p-4 text-white text-base border"
            style={{ textAlignVertical: 'top' }}
          />
          <Text className="text-gray-400 text-sm mt-2">
            This is the message that will be sent to you at the specific time.
          </Text>
        </View>

        {/* Date Selection Buttons */}
        <View className="mb-6 bg-primary rounded-lg">
          <TouchableOpacity onPress={handleOpenStartDatePicker} className="p-4 flex-row items-center justify-between border-b border-gray-700">
            <Text className="text-white text-base">Time to Send</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-300 mr-2">{formatDisplayDate(startDate)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleOpenEndDatePicker} className="p-4 flex-row items-center justify-between">
            <Text className="text-white text-base">End Date</Text>
            <View className="flex-row items-center">
              <Text className="text-gray-300 mr-2">{formatDisplayDate(endDate)}</Text>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Day Selection */}
        <View className="mb-8">
            <Text className="text-white text-base mb-4">Every:</Text>
            <View className="flex-row flex-wrap">
                {days.map(day => (
                    <DayButton key={day} day={day} isSelected={selectedDays.includes(day)} onPress={() => handleDayPress(day)} />
                ))}
            </View>
        </View>

        {/* Create Button */}
        <TouchableOpacity onPress={handleCreateRoutine} className="bg-mainPurple rounded-full py-4 px-6 mb-8">
          <Text className="text-white text-center font-semibold text-base">Create Routine</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* --- MODAL UNTUK DATE PICKER --- */}
      <Modal
        transparent={true}
        animationType="slide"
        visible={showStartDatePicker || showEndDatePicker}
        onRequestClose={closeModal}
      >
        <Pressable onPress={closeModal} className="flex-1 justify-end bg-black/50">
          <Pressable className="bg-black rounded-t-2xl" style={{ paddingBottom: insets.bottom }}>
            {/* Header Modal */}
            <View className="flex-row justify-between items-center p-4 bg-black">
                <TouchableOpacity onPress={closeModal}><Text className="text-mainPurple text-lg">Cancel</Text></TouchableOpacity>
                <Text className="text-white font-bold text-lg">{showStartDatePicker ? 'Time to Send' : 'End Date'}</Text>
                <TouchableOpacity onPress={showStartDatePicker ? confirmStartDate : confirmEndDate}><Text className="text-mainPurple text-lg font-bold">Confirm</Text></TouchableOpacity>
            </View>
            
            {/* Opsi Never untuk End Date */}
            {showEndDatePicker && (
                <TouchableOpacity onPress={clearEndDate} className="items-center ">
                    <Text className="text-red-500 text-lg">Set to Never</Text>
                </TouchableOpacity>
            )}

            {/* DateTimePicker Component */}
            <View className="p-2 bg-black">
                {showStartDatePicker && (
                    <DateTimePicker
                        mode="datetime" display="spinner" value={tempStartDate}
                        onChange={handleDateChange} textColor="white"
                    />
                )}
                {showEndDatePicker && (
                    <DateTimePicker
                        mode="datetime" display="spinner" value={tempEndDate}
                        onChange={handleDateChange} textColor="white"
                        minimumDate={minEndDate} // Validasi: End Date tidak boleh sebelum Start Date
                    />
                )}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}