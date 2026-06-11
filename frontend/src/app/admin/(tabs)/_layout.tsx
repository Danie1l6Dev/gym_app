import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DIMENSIONS } from '@/constants';
import { ADMIN_TAB_ITEMS } from '@/navigation/routes';
import { useTheme } from '@/hooks/use-theme';

type AdminTabName = (typeof ADMIN_TAB_ITEMS)[number]['name'];
type AdminIconName = keyof typeof MaterialCommunityIcons.glyphMap;

type TabBarRoute = {
  key: string;
  name: string;
};

type TabBarProps = {
  state: {
    index: number;
    routes: TabBarRoute[];
  };
  descriptors: Record<
    string,
    {
      options: {
        href?: string | null;
        tabBarButton?: (() => null) | undefined;
        tabBarAccessibilityLabel?: string;
        tabBarButtonTestID?: string;
      };
    }
  >;
  navigation: {
    emit: (event: { type: 'tabPress'; target: string; canPreventDefault: true }) => {
      defaultPrevented: boolean;
    };
    navigate: (name: string) => void;
  };
};

const ADMIN_TAB_ICONS: Record<AdminTabName, AdminIconName> = {
  dashboard: 'view-dashboard-outline',
  users: 'account-group-outline',
  exercises: 'dumbbell',
  memberships: 'card-account-details-outline',
  expiring: 'calendar-alert',
  manage: 'cog-outline',
};

const ADMIN_TAB_LABELS = ADMIN_TAB_ITEMS.reduce(
  (labels, item) => ({
    ...labels,
    [item.name]: item.label,
  }),
  {} as Record<AdminTabName, string>,
);

export default function AdminTabsLayout() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      tabBar={(props) => (
        <AdminTabBar
          {...props}
          bottomInset={insets.bottom}
          activeColor={theme.colors.primary}
          inactiveColor={theme.colors.textSubtle}
          backgroundColor={theme.colors.surface}
          borderColor={theme.colors.border}
        />
      )}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: ADMIN_TAB_ITEMS[0].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
          title: ADMIN_TAB_ITEMS[1].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          tabBarButton: () => null,
          tabBarItemStyle: { display: 'none' },
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
            <MaterialCommunityIcons name="calendar-alert" size={size ?? 22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="manage"
        options={{
          title: ADMIN_TAB_ITEMS[5].label,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size ?? 22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

function AdminTabBar({
  state,
  descriptors,
  navigation,
  bottomInset,
  activeColor,
  inactiveColor,
  backgroundColor,
  borderColor,
}: TabBarProps & {
  bottomInset: number;
  activeColor: string;
  inactiveColor: string;
  backgroundColor: string;
  borderColor: string;
}) {
  const visibleRoutes = state.routes
    .map((route, routeIndex) => ({ route, routeIndex }))
    .filter(({ route }) => descriptors[route.key]?.options.tabBarButton === undefined);

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor,
          borderTopColor: borderColor,
          height: DIMENSIONS.tabBarHeight + bottomInset,
          paddingBottom: Math.max(bottomInset, 8),
        },
      ]}>
      {visibleRoutes.map(({ route, routeIndex }) => {
        const tabName = route.name as AdminTabName;
        const isFocused = state.index === routeIndex;
        const color = isFocused ? activeColor : inactiveColor;
        const options = descriptors[route.key]?.options;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : undefined}
            accessibilityLabel={options?.tabBarAccessibilityLabel}
            testID={options?.tabBarButtonTestID}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            }}
            style={styles.tabButton}>
            <MaterialCommunityIcons name={ADMIN_TAB_ICONS[tabName]} size={22} color={color} />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              style={[styles.tabLabel, { color }]}>
              {ADMIN_TAB_LABELS[tabName]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    alignItems: 'flex-start',
    borderTopWidth: 1,
    flexDirection: 'row',
    overflow: 'visible',
    paddingHorizontal: 6,
    paddingTop: 8,
  },
  tabButton: {
    alignItems: 'center',
    flex: 1,
    gap: 3,
    height: DIMENSIONS.tabBarHeight - 16,
    justifyContent: 'center',
    minWidth: 0,
    overflow: 'visible',
    paddingHorizontal: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
    maxWidth: '100%',
    textAlign: 'center',
  },
});
