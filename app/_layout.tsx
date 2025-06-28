import { Stack } from "expo-router";
import "./global.css";

export default function RootLayout() {
  return <Stack> 
    <Stack.Screen
      name="(tabs)"
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="categories/notes"
      options={{headerShown: false,}}
    />
    <Stack.Screen
      name="categories/reminder"
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="categories/todolist"
      options={{headerShown: false}}
    />
  </Stack>;
}
