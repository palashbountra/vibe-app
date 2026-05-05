import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/theme';

type IconProps = { color: string; size: number; focused: boolean };

function TabIcon({ name, focused, color, size }: { name: any } & IconProps) {
  return <Ionicons name={focused ? name : `${name}-outline` as any} size={size} color={color} />;
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: (props: IconProps) => <TabIcon name="compass" {...props} />,
        }}
      />
      <Tabs.Screen
        name="communities"
        options={{
          title: 'Communities',
          tabBarIcon: (props: IconProps) => <TabIcon name="people" {...props} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Messages',
          tabBarIcon: (props: IconProps) => <TabIcon name="chatbubbles" {...props} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: (props: IconProps) => <TabIcon name="person" {...props} />,
        }}
      />
      {/* hide old matches tab */}
      <Tabs.Screen name="matches" options={{ href: null }} />
    </Tabs>
  );
}
