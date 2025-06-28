import FilterButtons from '@/components/FilterButtons';
import TaskItem from '@/components/TaskItem';
import { icons } from '@/constants/icons';
import React, { useMemo, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TodoItem {
  id: string;
  content: string;
  category: string;
  created_at: string;
  parsed_time?: string;
  is_completed: boolean;
}

export default function Todolist() {
  const insets = useSafeAreaInsets();
  const [showFinished, setShowFinished] = useState(false);
  
  // Dummy data for to-do items
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: '1',
      content: 'Take a bath',
      category: 'todolist',
      created_at: '2025-06-28T07:00:00Z',
      is_completed: true,
    },
    {
      id: '2',
      content: 'Take out the trash',
      category: 'todolist',
      created_at: '2025-06-28T08:00:00Z',
      is_completed: true,
    },
    {
      id: '3',
      content: 'Fix the AC',
      category: 'todolist',
      created_at: '2025-06-28T09:00:00Z',
      is_completed: false,
    },
    {
      id: '4',
      content: 'Clean the bed',
      category: 'todolist',
      created_at: '2025-06-28T10:00:00Z',
      is_completed: false,
    },
    {
      id: '5',
      content: 'Buy groceries',
      category: 'todolist',
      created_at: '2025-06-28T11:00:00Z',
      is_completed: false,
    },
    {
      id: '6',
      content: 'Call mom',
      category: 'todolist',
      created_at: '2025-06-28T12:00:00Z',
      is_completed: false,
    },
  ]);

  const handleToggleComplete = (id: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id 
          ? { ...todo, is_completed: !todo.is_completed }
          : todo
      )
    );
  };

  const filteredTodos = useMemo(() => {
    if (!showFinished) {
      return todos.filter(todo => !todo.is_completed);
    }
    return todos;
  }, [todos, showFinished]);

  const handleGoBack = () => {
    // TODO: Implement navigation back
    console.log('Go back');
  };

  // Group todos by completion status for display
  const { completedTodos, pendingTodos } = useMemo(() => {
    const completed = filteredTodos.filter(t => t.is_completed);
    const pending = filteredTodos.filter(t => !t.is_completed);
    return { completedTodos: completed, pendingTodos: pending };
  }, [filteredTodos]);

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View 
        className="flex-row items-center justify-between px-6 py-4 border-b border-gray-800"
        style={{ paddingTop: insets.top + 16 }}
      >
        <TouchableOpacity onPress={handleGoBack}>
          <Image 
            source={icons.left}
            className="w-6 h-6"
            style={{ tintColor: '#ffffff' }}
          />
        </TouchableOpacity>
        
        <Text className="text-white text-lg font-semibold">
          To-Do List
        </Text>
        
        <View className="w-6" />
      </View>

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {pendingTodos.length === 0 && completedTodos.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-base">No tasks found</Text>
          </View>
        ) : (
          <>
            {/* Pending Tasks */}
            {pendingTodos.map((todo) => (
              <TaskItem
                key={todo.id}
                id={todo.id}
                content={todo.content}
                parsedTime={todo.parsed_time}
                isCompleted={todo.is_completed}
                onToggleComplete={handleToggleComplete}
              />
            ))}

            {/* Completed Tasks */}
            {showFinished && completedTodos.map((todo) => (
              <TaskItem
                key={todo.id}
                id={todo.id}
                content={todo.content}
                parsedTime={todo.parsed_time}
                isCompleted={todo.is_completed}
                onToggleComplete={handleToggleComplete}
              />
            ))}
          </>
        )}
      </ScrollView>

      {/* Filter Buttons */}
      <FilterButtons
        activeFilter="all"
        onFilterChange={() => {}} // To-do list only has 'all' filter
        showFinished={showFinished}
        onToggleFinished={() => setShowFinished(!showFinished)}
        type="todolist"
      />
    </View>
  );
}