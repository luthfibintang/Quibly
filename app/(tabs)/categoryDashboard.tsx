import CategoryCard from '@/components/CategoryCard';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CategoryDashboard() {
  const insets = useSafeAreaInsets();
  
  const categories = [
    { title: 'Reminder', url: 'reminder' },
    { title: 'To-Do List', url: 'todolist' },
    { title: 'Notes', url: 'notes' },
  ];

  return (
    <View className="flex-1 bg-black">
      <ScrollView 
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 20 }}
      >
        {categories.map((category, index) => (
          <CategoryCard
            key={category.url}
            url={category.url}
            title={category.title}
          />
        ))}
      </ScrollView>
    </View>
  );
}