import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import { ADMIN_TAB_ITEMS } from '@/navigation/routes';
import { useTheme } from '@/hooks/use-theme';

export default function AdminTabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
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
        name="dashboard"
        options={{
          title: ADMIN_TAB_ITEMS[0].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="shield-view-dashboard-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: ADMIN_TAB_ITEMS[1].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: ADMIN_TAB_ITEMS[2].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dumbbell" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memberships"
        options={{
          title: ADMIN_TAB_ITEMS[3].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="card-account-details-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="expiring"
        options={{
          title: ADMIN_TAB_ITEMS[4].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-alert-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
