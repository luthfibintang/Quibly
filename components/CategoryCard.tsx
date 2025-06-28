import { icons } from '@/constants/icons';
import { Link } from 'expo-router';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';

export interface CategoryFolderProps {
  title: string;
  onPress?: () => void;
  url: string;
}

export default function CategoryCarrd({ title, onPress, url }: CategoryFolderProps) {
  // console.log(url)
  return (
    <Link href={`/categories/${url}` as any}  asChild>
      <TouchableOpacity
        className="flex-row items-center justify-between px-10 py-8"
        activeOpacity={0.7}
      >
        {/* Left side with folder icon and title */}
        <View className="flex-row items-center flex-1">
          <Image 
            source={icons.folder}
            className="w-8 h-8 mr-4"
            style={{ tintColor: '#9CA3AF' }}
          />
          <Text className="text-white text-lg font-medium">
            {title}
          </Text>
        </View>

        {/* Right arrow icon */}
        <Image 
          source={icons.left}
          className="w-8 h-8"
          style={{ 
            tintColor: '#9CA3AF',
            transform: [{ scaleX: -1 }] // Flip horizontal to make it point right
          }}
        />
        <View className="absolute bottom-0 left-20 right-10 h-[1px] bg-kindaBlack" />
      </TouchableOpacity>
    </Link>
  );
}