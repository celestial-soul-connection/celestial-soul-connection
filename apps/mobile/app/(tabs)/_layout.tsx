/**
 * Main app shell — a glass bottom tab bar so the app NEVER dead-ends and there's
 * always a clear next move. Four tabs:
 *   Today    — daily celestial home + your heartbeat (never idle)
 *   Discover — the one curated soul for you
 *   Messages — your conversations, one tap away
 *   Profile  — you (settings live here)
 * Reached after onboarding; always navigable.
 */
import React from 'react';
import { View, Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Text } from '../../src/components/Text';
import { haptic } from '../../src/lib/haptics';

const TABS = [
  { name: 'today', label: 'Today', icon: '☀' },
  { name: 'discover', label: 'Discover', icon: '✦' },
  { name: 'messages', label: 'Messages', icon: '♥' },
  { name: 'profile', label: 'Profile', icon: '☾' },
];

export default function TabLayout() {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <BlurView intensity={t.feel.glass.intensity + 20} tint={t.mode === 'dark' ? 'dark' : 'light'} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: t.colors.border, paddingBottom: insets.bottom, paddingTop: t.spacing.sm }}>
          <View style={{ flexDirection: 'row' }}>
            {TABS.map((tab, i) => {
              const focused = state.index === i;
              return (
                <Pressable
                  key={tab.name}
                  onPress={() => { haptic.light(); navigation.navigate(tab.name); }}
                  style={{ flex: 1, alignItems: 'center', paddingVertical: t.spacing.sm, gap: 3 }}>
                  <Text variant="title" style={{ color: focused ? t.colors.primary : t.colors.textFaint, fontSize: 20 }}>{tab.icon}</Text>
                  <Text variant="caption" style={{ color: focused ? t.colors.primary : t.colors.textFaint }}>{tab.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </BlurView>
      )}>
      <Tabs.Screen name="today" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="messages" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
