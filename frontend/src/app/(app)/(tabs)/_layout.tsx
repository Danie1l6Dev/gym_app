import { Redirect, Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DIMENSIONS, ROUTES } from '@/constants';
import { TAB_ITEMS } from '@/navigation/routes';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

type TabIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export default function TabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  if (user?.role?.slug === 'admin') {
    return <Redirect href={ROUTES.app.adminDashboard as never} />;
  }

  const renderTabIcon = (name: TabIconName, label: string, color: ColorValue) => (
    <View style={styles.tabContent}>
      <MaterialCommunityIcons name={name} size={21} color={color} />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
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
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: DIMENSIONS.tabBarHeight + insets.bottom,
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingHorizontal: 8,
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
        name="home"
        options={{
          title: TAB_ITEMS[0].label,
          tabBarIcon: ({ color }) => renderTabIcon('view-dashboard-outline', TAB_ITEMS[0].label, color),
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: TAB_ITEMS[1].label,
          tabBarIcon: ({ color }) => renderTabIcon('repeat-variant', TAB_ITEMS[1].label, color),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: TAB_ITEMS[2].label,
          tabBarIcon: ({ color }) => renderTabIcon('compass-outline', TAB_ITEMS[2].label, color),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: TAB_ITEMS[3].label,
          tabBarIcon: ({ color }) => renderTabIcon('account-outline', TAB_ITEMS[3].label, color),
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
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
    maxWidth: '100%',
    textAlign: 'center',
  },
});
