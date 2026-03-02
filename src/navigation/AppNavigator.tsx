import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootStackParamList, BottomTabParamList } from '../types';
import { EncyclopediaScreen } from '../screens/EncyclopediaScreen';
import { CharacterDetailScreen } from '../screens/CharacterDetailScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { COLORS, FONT_SIZES, SPACING } from '../constants';
import { useFavorites } from '../context/FavoritesContext';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<BottomTabParamList>();

// ─── Tab icons ────────────────────────────────────────────────────────────────

const TAB_ICONS: Record<string, string> = {
  Encyclopedia: '📖',
  Search:       '🔍',
  Favorites:    '⭐',
};

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.55 }}>
      {TAB_ICONS[label] ?? '•'}
    </Text>
  );
}

// ─── Custom header title for Encyclopedia (branded) ──────────────────────────

function DokkanDexTitle() {
  return (
    <View style={headerStyles.titleRow}>
      <Text style={headerStyles.titleDragon}>Dokkan</Text>
      <Text style={headerStyles.titleDex}>Dex</Text>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
  },
  titleDragon: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  titleDex: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.xl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

// ─── Bottom Tabs ──────────────────────────────────────────────────────────────

function MainTabs() {
  const { favoriteIds } = useFavorites();
  const favCount = favoriteIds.size;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: 'rgba(245,166,35,0.2)',
          borderTopWidth: 1,
          paddingBottom: SPACING.xs,
          height: 56,
        },
        tabBarActiveTintColor:   COLORS.gold,
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarLabelStyle: {
          fontSize: FONT_SIZES.xs,
          fontWeight: '600',
          marginBottom: 2,
        },
        headerStyle: {
          backgroundColor: COLORS.surface,
          shadowColor: 'rgba(245,166,35,0.3)',
          shadowOpacity: 1,
          shadowRadius: 4,
          elevation: 6,
        },
        headerTitleStyle: { color: COLORS.text.primary, fontWeight: '700' },
        headerTintColor:  COLORS.text.primary,
      })}
    >
      <Tab.Screen
        name="Encyclopedia"
        component={EncyclopediaScreen}
        options={{ headerTitle: () => <DokkanDexTitle /> }}
      />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ tabBarBadge: favCount > 0 ? favCount : undefined }}
      />
    </Tab.Navigator>
  );
}

// ─── Root Stack ───────────────────────────────────────────────────────────────

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.surface,
          },
          headerTitleStyle: { color: COLORS.text.primary, fontWeight: '700' },
          headerTintColor:  COLORS.gold,
          contentStyle:     { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen
          name="Main"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="CharacterDetail"
          component={CharacterDetailScreen}
          // Title is set dynamically once the character loads
          options={{ title: '' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
