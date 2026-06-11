import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DIMENSIONS } from '@/constants';
import { ADMIN_TAB_ITEMS } from '@/navigation/routes';
import { useTheme } from '@/hooks/use-theme';

type TabIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function AdminTabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const renderTabIcon = (name: TabIconName, label: string, color: ColorValue) => (
    <View style={styles.tabContent}>
      <MaterialCommunityIcons name={name} size={21} color={color} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[styles.tabLabel, { color }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSubtle,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: DIMENSIONS.tabBarHeight + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingHorizontal: 6,
        },
        tabBarItemStyle: {
          height: DIMENSIONS.tabBarHeight - 14,
          paddingVertical: 0,
        },
        tabBarIconStyle: {
          height: '100%',
          width: '100%',
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: ADMIN_TAB_ITEMS[0].label,
          tabBarIcon: ({ color }) => renderTabIcon('view-dashboard-outline', ADMIN_TAB_ITEMS[0].label, color),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          title: ADMIN_TAB_ITEMS[1].label,
          tabBarIcon: ({ color }) => renderTabIcon('account-group-outline', ADMIN_TAB_ITEMS[1].label, color),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          title: ADMIN_TAB_ITEMS[2].label,
          tabBarIcon: ({ color }) => renderTabIcon('dumbbell', ADMIN_TAB_ITEMS[2].label, color),
        }}
      />
      <Tabs.Screen
        name="memberships"
        options={{
          title: ADMIN_TAB_ITEMS[3].label,
          tabBarIcon: ({ color }) => renderTabIcon('card-account-details-outline', ADMIN_TAB_ITEMS[3].label, color),
        }}
      />
      <Tabs.Screen
        name="expiring"
        options={{
          title: ADMIN_TAB_ITEMS[4].label,
          tabBarIcon: ({ color }) => renderTabIcon('calendar-alert', ADMIN_TAB_ITEMS[4].label, color),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: ADMIN_TAB_ITEMS[5].label,
          tabBarIcon: ({ color }) => renderTabIcon('cog-outline', ADMIN_TAB_ITEMS[5].label, color),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabContent: {
    alignItems: 'center',
    gap: 3,
    height: '100%',
    justifyContent: 'center',
    minWidth: 0,
    width: '100%',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    maxWidth: '100%',
    textAlign: 'center',
  },
});
