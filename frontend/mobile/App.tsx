import React from 'react';
import { ActivityIndicator, I18nManager, StatusBar, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, VarelaRound_400Regular } from '@expo-google-fonts/varela-round';
import { theme } from './src/theme';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LoginScreen } from './src/screens/LoginScreen';
import { MainTabNavigator } from './src/navigation/MainTabNavigator';

// Enforce strict RTL for Hebrew
if (!I18nManager.isRTL) {
  I18nManager.forceRTL(true);
}

// Apply the rounded font as the global default for Text / TextInput
const applyDefaultFont = () => {
  const defaultStyle = { fontFamily: theme.typography.fonts.regular };
  for (const Comp of [Text, TextInput] as any[]) {
    Comp.defaultProps = Comp.defaultProps || {};
    Comp.defaultProps.style = [defaultStyle, Comp.defaultProps.style];
  }
};

function NavigationRoot() {
  const { user } = useAuth();
  return user ? <MainTabNavigator /> : <LoginScreen />;
}

export default function App() {
  const [fontsLoaded] = useFonts({ VarelaRound_400Regular });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  applyDefaultFont();

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <AuthProvider>
        <NavigationRoot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
