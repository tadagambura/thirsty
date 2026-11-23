import { Baloo2_800ExtraBold, useFonts } from '@expo-google-fonts/baloo-2';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Intro } from '@/kit/Intro';
import { prefsStore } from '@/kit/prefs';
import { KitRoot } from '@/kit/Root';
import { useTheme } from '@/kit/theme';
import { brand } from '@/brand';

SplashScreen.preventAutoHideAsync().catch(() => {});
const usePrefs = prefsStore('thirsty', 9);
const Art = ({ children }: { children: string }) => <Text style={{ fontSize: 88 }}>{children}</Text>;

function Shell() {
  const { c } = useTheme();
  const onboarded = usePrefs((s) => s.onboarded);
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: c.bg } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="plant/new" options={{ headerShown: true, title: 'New plant', presentation: 'modal', headerTintColor: c.text, headerStyle: { backgroundColor: c.bg }, headerShadowVisible: false }} />
        <Stack.Screen name="plant/[id]" options={{ headerShown: true, title: '', headerTintColor: c.text, headerStyle: { backgroundColor: c.bg }, headerShadowVisible: false }} />
      </Stack>
      {!onboarded ? (
        <View style={StyleSheet.absoluteFill}>
          <Intro
            cta="Add my first plant"
            onDone={() => usePrefs.getState().setOnboarded()}
            steps={[
              { title: 'Every plant, its own profile', body: 'Give each plant a name and a care schedule. Thirsty reminds you when someone needs a drink.', art: <Art>🪴</Art> },
              { title: 'One tap: watered', body: 'Log care in a tap, earn gems, and watch for milestones like a first new leaf.', art: <Art>💧</Art> },
              { title: 'Drama included', body: "Forget for too long and your plant's in-app health hits zero. Don't worry: you can always bring it back.", art: <Art>🎻</Art> },
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({ Baloo2_800ExtraBold });
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);
  if (!loaded && !error) return null;
  return (
    <KitRoot brand={brand}>
      <Shell />
    </KitRoot>
  );
}
