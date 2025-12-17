import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import MapboxView from './components/MapboxView';

import Navbar from "./components/Navbar";
import ContextWrapper from './useContext/ContextWrapper';
import { useEffect, useState } from 'react';


export default function Index() {
  const [busStopInfo, setBusStopInfo] = useState([]);
  const [busLineInfo, setBusLineInfo] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(true);

 const port = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
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



  useEffect(() => {
    const url = `${port}/busLineInfo`;
    const fetchBusLine = async () => {
      try {

        const res = await fetch(url, {
          next: { revalidate: 300 }, // Revalidate every 5 minutes
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setBusLineInfo(data)
        return data;

      } catch (error) {
        console.error("Error fetching bus Line Info:", error);
        return []; // Return empty array instead of null for better error handling
      }
    }
    fetchBusLine()

  }, [])

    useEffect(() => {
    const url = `${port}/busStopInfo`;
    const fetchBusStop = async () => {
      try {

        const res = await fetch(url, {
          next: { revalidate: 300 }, // Revalidate every 5 minutes
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        setBusStopInfo(data);
        return data;

      } catch (error) {
        console.error("Error fetching bus stop Info:", error);
        return []; // Return empty array instead of null for better error handling
      }  finally {
        setLoading(false)
      }
    }
    fetchBusStop()

  }, [])




  if (loading) {
    return (
      <View style={styles.mainContainer}>
        <View style={styles.contentArea}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={{ marginTop: 10 }}>Loading ...</Text>
        </View>
      </View>
    );
  }

  return (
    <ContextWrapper busStops={busStopInfo} busLines={busLineInfo}>
      <View style={styles.mainContainer}>
        
      <View style={styles.mapContainer}>
        <MapboxView
          busStops={busStopInfo}
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