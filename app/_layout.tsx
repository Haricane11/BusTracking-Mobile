import { Stack } from "expo-router";
import { useEffect } from 'react'; 
import * as NavigationBar from 'expo-navigation-bar';
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
    
    // 1. Define the effect to run only once on mount
    useEffect(() => {
        const setNavigationBarVisibility = async () => {
            try {
                // 2. 🎯 Set the system navigation bar to be fully hidden (immersive mode)
                await NavigationBar.setVisibilityAsync("hidden");
                
                // Optional: Adjust the system bar's behavior
                // await NavigationBar.setBehaviorAsync('overlay-swipe');
            } catch (e) {
                console.error("Failed to set navigation bar visibility:", e);
            }
        };

        setNavigationBarVisibility();
        
        // Optional: Return a cleanup function if you want the bar to reappear 
        // when the app exits, though usually not necessary for a persistent setting.
    }, []); 

    return (
        <SafeAreaProvider>

                <Stack>
                    <Stack.Screen
                        name="index"
                        options={{ headerShown: false}}
                    />
                 
                </Stack>
        </SafeAreaProvider>
    );
}