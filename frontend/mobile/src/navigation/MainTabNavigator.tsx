import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../theme';
import { HomeScreen } from '../screens/HomeScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

type TabKey = 'home' | 'leaderboard' | 'profile';

const TABS: { key: TabKey; label: string; icon: string; Component: React.FC }[] = [
  { key: 'home', label: 'לימוד', icon: '🏠', Component: HomeScreen },
  { key: 'leaderboard', label: 'ליגות', icon: '🏆', Component: LeaderboardScreen },
  { key: 'profile', label: 'פרופיל', icon: '👤', Component: ProfileScreen },
];

/**
 * Lightweight bottom tab navigator (no extra navigation dependency required).
 * Can be swapped for @react-navigation/bottom-tabs later without touching the screens.
 */
export const MainTabNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const insets = useSafeAreaInsets();
  const ActiveScreen = TABS.find((t) => t.key === activeTab)!.Component;

  return (
    <View style={theme.presets.backgrounds.mainScreen}>
      <View style={{ flex: 1 }}>
        <ActiveScreen />
      </View>

      <View style={[theme.presets.tabBar.container, { paddingBottom: theme.spacing.sm + insets.bottom }]}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[theme.presets.tabBar.item, isActive && theme.presets.tabBar.itemActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Text style={theme.presets.tabBar.icon}>{tab.icon}</Text>
              <Text style={[theme.presets.tabBar.label, isActive && theme.presets.tabBar.labelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};
