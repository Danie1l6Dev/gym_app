import { Tabs } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '@/theme';
import { TAB_ITEMS } from '@/navigation';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 76,
          paddingTop: spacing.sm,
          paddingBottom: spacing.md,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      {TAB_ITEMS.map((item) => (
        <Tabs.Screen
          key={item.name}
          name={item.name}
          options={{
            title: item.label,
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
                <Text style={[styles.iconLabel, focused ? styles.iconLabelActive : null]}>
                  {item.icon}
                </Text>
              </View>
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrapActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  iconLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  iconLabelActive: {
    color: colors.primary,
  },
});
