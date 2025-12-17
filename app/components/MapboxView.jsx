import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useRef, useEffect } from 'react';
import { useMyContext } from '../useContext/UseContext';

export default function MapboxView({ busStops, currentLocation }) {
  const { specificBusStop, setNearby, routeInfo, setSpecificBusStop, setRouteInfo } = useMyContext();
  const webViewRef = useRef(null);

  // Get the token from the environment
  const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
  // This script runs as soon as the WebView loads
  const injectToken = `
    window.MAPBOX_ACCESS_TOKEN = "${MAPBOX_TOKEN}";
    true; // note: this is required for injectedJavaScript to work
  `;

  useEffect(() => {
    if (!webViewRef.current || !currentLocation) return;

    const normalizedLocation = Array.isArray(currentLocation)
      ? { longitude: currentLocation[0], latitude: currentLocation[1] }
      : currentLocation;

    webViewRef.current.postMessage(
      JSON.stringify({
        busStops,
        currentLocation: normalizedLocation,
        specificBusStop,
        routeInfo,
        // Also pass it here just in case your script needs it via message
        mapboxToken: MAPBOX_TOKEN, 
      })
    );
  }, [busStops, currentLocation, specificBusStop, routeInfo]);

  return (
    <View style={{ flex: 1 }}>
      <WebView
        ref={webViewRef}
        source={require('../../assets/mapbox.html')}
        javaScriptEnabled
        domStorageEnabled
        injectedJavaScript={injectToken} // <--- Injects the token immediately
         onMessage={(e) => {
          try {
            const msg = JSON.parse(e.nativeEvent.data);
            if (msg.type === 'LOG') {
              const data = typeof msg.message === 'string'
                ? JSON.parse(msg.message) // parse the stringified object
                : msg.message;            // already an object
              setNearby(prev => [...prev, data]); // add to state
            }
            else if(msg.type === "REQUEST_LOCATION") {
              setRouteInfo(null)
              setSpecificBusStop(null)
            }
          } catch (err) {
            console.warn("Failed to parse LOG message:", err);
          }
        }}
      />
    </View>
  );
}