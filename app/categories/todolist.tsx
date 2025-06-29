import FilterButtons from '@/components/FilterButtons';
import TaskItem from '@/components/TaskItem';
import { icons } from '@/constants/icons';
import { QuiblyDB } from '@/services/firebase'; // Import Firebase database functions
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TodoItem {
  id: string;
  content: string;
  created_at: string;
  parsed_time?: string;
  is_completed: boolean;
  due_date?: string;
}

export default function Todolist() {
  const insets = useSafeAreaInsets();
  const [showFinished, setShowFinished] = useState(false);
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Listen to todos from Firebase on component mount
  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = QuiblyDB.listenToTodos((firebaseTodos: FirebaseTodo[]) => {
      try {
        // Transform Firebase data to match our interface
        const transformedTodos: TodoItem[] = firebaseTodos.map(todo => ({
          id: todo.id,
          content: todo.content,
          created_at: todo.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
          is_completed: todo.is_completed,
          due_date: todo.due_date,
          // Use due_date as parsed_time if available, otherwise use created_at
          parsed_time: todo.due_date || todo.created_at?.toDate?.()?.toISOString() || new Date().toISOString()
        }));
        
        setTodos(transformedTodos);
        setLoading(false);
      } catch (err) {
        console.error('Error processing todos:', err);
        setError('Failed to process todos');
        setLoading(false);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const loadTodos = () => {
    // Since we're using real-time listener, we don't need to manually reload
    // This function can be used to clear errors or show a refresh indicator
    setError(null);
  };

  const handleToggleComplete = async (id: string) => {
    try {
      // Find the current todo to get its current status
      const currentTodo = todos.find(t => t.id === id);
      if (!currentTodo) return;

      const newCompletedStatus = !currentTodo.is_completed;

      // Update in Firebase - the real-time listener will update the UI
      await QuiblyDB.updateTodoStatus(id, newCompletedStatus);
      
      // console.log(`Todo ${id} status updated to: ${newCompletedStatus}`);
    } catch (error) {
      console.error('Error updating todo status:', error);
      setError('Failed to update todo status');
    }
  };

  const filteredTodos = useMemo(() => {
    let filtered = todos;

    if (activeFilter === 'due-date') {
      filtered = filtered.filter(todo => !!todo.due_date);
    }

    if (!showFinished) {
      return filtered.filter(todo => !todo.is_completed);
    }
    return filtered;
  }, [todos, showFinished, activeFilter]);

  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  // Group todos by completion status for display
  const { completedTodos, pendingTodos } = useMemo(() => {
    const completed = filteredTodos.filter(t => t.is_completed);
    const pending = filteredTodos.filter(t => !t.is_completed);
    return { completedTodos: completed, pendingTodos: pending };
  }, [filteredTodos]);

  // Show loading state
  if (loading) {
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

        {/* Loading State */}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text className="text-gray-500 text-base mt-4">Loading todos...</Text>
        </View>
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
        
        <TouchableOpacity onPress={loadTodos}>
          <Text className="text-mainPurple text-sm">Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Error State */}
      {error && (
        <View className="px-6 py-2 bg-red-900/20">
          <Text className="text-red-400 text-sm">{error}</Text>
        </View>
      )}

      {/* Content */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {pendingTodos.length === 0 && completedTodos.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Text className="text-gray-500 text-base">No tasks found</Text>
            <TouchableOpacity 
              onPress={loadTodos}
              className="mt-4 px-4 py-2 bg-mainPurple rounded-lg"
            >
              <Text className="text-white text-sm">Reload</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Pending Tasks */}
            {pendingTodos.length > 0 && (
              <>
                <View className="px-6 py-4">
                  <Text className="text-mainPurple text-sm font-medium">Tasks</Text>
                </View>
                {pendingTodos.map((todo) => (
                  <TaskItem
                    key={todo.id}
                    id={todo.id}
                    content={todo.content}
                    dueDate={todo.due_date}
                    isCompleted={todo.is_completed}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </>
            )}

            {/* Completed Tasks */}
            {showFinished && completedTodos.length > 0 && (
              <>
                <View className="px-6 py-4">
                  <Text className="text-mainPurple text-sm font-medium">Completed</Text>
                </View>
                {completedTodos.map((todo) => (
                  <TaskItem
                    key={todo.id}
                    id={todo.id}
                    content={todo.content}
                    dueDate={todo.due_date}
                    isCompleted={todo.is_completed}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      {/* Filter Buttons */}
      <FilterButtons
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter} // To-do list only has 'all' filter
        showFinished={showFinished}
        onToggleFinished={() => setShowFinished(!showFinished)}
        type="todolist"
      />
    </View>
  );
}