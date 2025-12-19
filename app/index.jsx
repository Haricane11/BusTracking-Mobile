import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapboxView from './components/MapboxView';

import Navbar from "./components/Navbar";
import ContextWrapper from './useContext/ContextWrapper';
import { useEffect, useState } from 'react';


export default function Index() {
  const [data, setData] = useState({ stops: [], lines: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  const port = process.env.EXPO_PUBLIC_API_URL;

  const fetchData = async () => {
    setLoading(true);
    setError(false);

    // Create a timeout controller (e.g., 10 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const [stopsRes, linesRes] = await Promise.all([
        fetch(`${port}/busStopInfo`, { signal: controller.signal }),
        fetch(`${port}/busLineInfo`, { signal: controller.signal })
      ]);

      if (!stopsRes.ok || !linesRes.ok) throw new Error("Server Error");

      const stopsData = await stopsRes.json();
      const linesData = await linesRes.json();

      setData({ stops: stopsData, lines: linesData });
    } catch (err) {
      console.error("Fetch failed:", err);
      setError(true);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchData();

      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          return;
        }
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        
        setCurrentLocation([
          location.coords.longitude,
          location.coords.latitude,
        ]);
      })();

  }, []);

  if (loading) {
    return (
      <View style={styles.contentArea}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.contentArea}>
        <Text>Could not load bus data.</Text>
        <Text>Reload the page.</Text>
      </View>
    );
  }
  return (
    <ContextWrapper busStops={data.stops} busLines={data.lines}>
      <View style={styles.mainContainer}>
        <View style={styles.mapContainer}>
          <MapboxView
            busStops={data.stops}
            currentLocation={currentLocation}
          />
        </View>
        <Navbar />
      </View>
    </ContextWrapper>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F2EDE9',
  },
 contentArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
    mapContainer: {
    flex: 1, 
  },
});