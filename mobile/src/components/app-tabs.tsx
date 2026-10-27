/**
 * AppTabs — native bottom tab navigator for LeadPulse.
 *
 * Tabs shown: Home (Inbox), Pipeline, Insights
 * Hidden from tab bar: Explore (kept to avoid breaking Expo Router; href: null)
 * Hidden from tab bar: leads/* (Stack navigator for detail screen; href: null)
 *
 * Icons: home.png and explore.png exist in assets/images/tabIcons/.
 * pipeline.png and insights.png do not exist, so explore.png is reused as a
 * generic icon for Pipeline and Insights until custom assets are added.
 */
import { Tabs } from 'expo-router';
import { Image, useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
      }}>
      {/* Inbox — primary tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => (
            <Image
              source={require('@/assets/images/tabIcons/home.png')}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      {/* Pipeline */}
      <Tabs.Screen
        name="pipeline"
        options={{
          title: 'Pipeline',
          tabBarIcon: ({ color }) => (
            // No pipeline.png asset yet — reuse explore.png as a generic icon
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      {/* Insights */}
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color }) => (
            // No insights.png asset yet — reuse explore.png as a generic icon
            <Image
              source={require('@/assets/images/tabIcons/explore.png')}
              style={{ width: 24, height: 24, tintColor: color }}
            />
          ),
        }}
      />

      {/* Explore — hidden from tab bar; route kept to avoid Expo Router errors */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
          title: 'Explore',
        }}
      />

      {/* leads/* — Stack navigator group; not a tab */}
      <Tabs.Screen
        name="leads"
        options={{
          href: null,
          title: 'Lead Detail',
        }}
      />
    </Tabs>
  );
}
