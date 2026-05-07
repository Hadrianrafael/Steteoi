import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LoadingScreen } from "@/components/LoadingScreen";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { game } from "@/constants/colors";
import { GameProvider, useGame } from "@/contexts/GameContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function StackNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: game.bgDeep },
        headerTintColor: game.text,
        headerTitleStyle: { fontFamily: "Inter_700Bold" },
        contentStyle: { backgroundColor: game.bg },
        headerBackTitle: "Voltar",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="lobby"
        options={{ headerShown: false, animation: "slide_from_bottom" }}
      />
      <Stack.Screen
        name="game"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="result"
        options={{
          headerShown: false,
          animation: "fade",
          presentation: "transparentModal",
        }}
      />
      <Stack.Screen name="shop" options={{ title: "Loja" }} />
      <Stack.Screen name="planes" options={{ title: "Arsenal — Aviões" }} />
      <Stack.Screen name="upgrades" options={{ title: "Melhorias" }} />
      <Stack.Screen name="skills" options={{ title: "Habilidades" }} />
      <Stack.Screen name="ranking" options={{ title: "Ranking" }} />
      <Stack.Screen name="events" options={{ title: "Eventos" }} />
      <Stack.Screen name="missions" options={{ title: "Missões" }} />
      <Stack.Screen name="cards" options={{ title: "Cartas" }} />
      <Stack.Screen
        name="settings"
        options={{ title: "Configurações", presentation: "modal" }}
      />
    </Stack>
  );
}

function AppShell() {
  const { ready, isFirstLaunch, setName } = useGame();

  if (!ready) return <LoadingScreen />;

  if (isFirstLaunch) {
    return (
      <WelcomeScreen
        onComplete={(name) => {
          setName(name);
        }}
      />
    );
  }

  return <StackNav />;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GameProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: game.bg }}>
              <KeyboardProvider>
                <StatusBar style="light" />
                <AppShell />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </GameProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
