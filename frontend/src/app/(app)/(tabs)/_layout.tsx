import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import { TAB_ITEMS } from '@/navigation/routes';
import { useTheme } from '@/hooks/use-theme';

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: DIMENSIONS.tabBarHeight,
          paddingTop: 10,
          paddingBottom: 14,
          paddingHorizontal: 10,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
        tabBarItemStyle: {
          paddingVertical: 6,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: TAB_ITEMS[0].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: TAB_ITEMS[1].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="repeat-variant" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: TAB_ITEMS[2].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="compass-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_ITEMS[3].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
