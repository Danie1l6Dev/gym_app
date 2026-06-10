import { Stack } from 'expo-router';

export default function ManageLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="memberships" options={{ headerShown: false }} />
      <Stack.Screen name="users" options={{ headerShown: false }} />
      <Stack.Screen name="exercises" options={{ headerShown: false }} />
      <Stack.Screen name="routines" options={{ headerShown: false }} />
    </Stack>
  );
}
