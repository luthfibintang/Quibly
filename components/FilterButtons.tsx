import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface FilterButtonsProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  showFinished: boolean;
  onToggleFinished: () => void;
  type: 'reminder' | 'todolist';
}

export default function FilterButtons({ 
  activeFilter, 
  onFilterChange, 
  showFinished, 
  onToggleFinished,
  type 
}: FilterButtonsProps) {
  const getFilterButtons = () => {
    if (type === 'reminder') {
      return [
        { key: 'today', label: 'Today' },
        { key: 'upcoming', label: 'Upcoming' },
        { key: 'all', label: 'All' },
      ];
    } else {
      return [
        { key: 'all', label: 'All' },
        {key: 'due-date', label: 'Has Due Date'}
      ];
    }
  };

  const filterButtons = getFilterButtons();

  return (
    <View className="flex-row justify-between items-center px-6 py-4 pb-10 bg-black border-t border-kindaBlack">
      {/* Filter Buttons */}
      <View className="flex-row space-x-2 gap-x-2">
        {filterButtons.map((button) => (
          <TouchableOpacity
            key={button.key}
            onPress={() => onFilterChange(button.key)}
            className={`px-4 py-2 rounded-full ${
              activeFilter === button.key
                ? 'bg-mainPurple'
                : 'bg-kindaBlack'
            }`}
            activeOpacity={0.7}
          >
            <Text 
              className={`text-sm font-medium ${
                activeFilter === button.key ? 'text-white' : 'text-gray-400'
              }`}
            >
              {button.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Show Finished Button */}
      <TouchableOpacity
        onPress={onToggleFinished}
        className={`px-4 py-2 rounded-full ${
          showFinished ? 'bg-mainPurple' : 'bg-kindaBlack'
        }`}
        activeOpacity={0.7}
      >
        <Text 
          className={`text-sm font-medium ${
            showFinished ? 'text-white' : 'text-gray-400'
          }`}
        >
          Show Finished
        </Text>
      </TouchableOpacity>
    </View>
  );
}