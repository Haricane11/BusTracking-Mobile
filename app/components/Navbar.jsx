import { View, StyleSheet, Pressable, Animated, Easing, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Navbtn from '../components/Navbtn';
import BusStopPopUp from '../components/BusStopPopUp';
import BusLinePopUp from '../components/BusLinePopUp';
import Nearby from '../components/Nearby';
import Directions from '../components/Directions';
import { useMyContext } from '../useContext/UseContext';
import { useRef, useEffect, act } from "react"

export default function Navbar() {
  const { activeNav, setActiveNav, activeSearch, setSpecificBusStop, setRouteInfo } = useMyContext();

  // Function to close the navbar/popup
  const handleOnClick = () => {
    setActiveNav(false);
    setSpecificBusStop(null);
    setRouteInfo(null);
  };


  // 1. Initialize the Animated Value always at 0. 
  const animatedBottom = useRef(new Animated.Value(0)).current;

  // 2. Define the animation logic inside a useEffect hook
  useEffect(() => {
    const finalValue = activeNav ? 1 : 0;

    Animated.timing(
      animatedBottom,
      {
        toValue: finalValue,
        duration: 300,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }
    ).start();

    if(activeNav !== "Directions") {
      setRouteInfo(null)
    } 
    
    if (activeNav !== "BusStops" || activeNav !== "Nearby") {
      setSpecificBusStop(null)
    }

  }, [activeNav]);

  // 3. Interpolate the bottom value for the Navbar
  const navbarBottomStyle = animatedBottom.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${activeSearch ? "80%" : "50%"}`],
  });

  // 4. Interpolate the height value for the Popup Container
  const popupHeightStyle = animatedBottom.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', `${activeSearch ? "80%" : "50%"}`],
  });

  // 5. Combine the animated styles
  const animatedNavbarStyle = [
    styles.navbarContainer,
    { bottom: navbarBottomStyle }
  ];

  const animatedPopupStyle = [
    styles.popupContainer,
    { height: popupHeightStyle }
  ];

  return (
    <>
      {/* Popup Overlay: This is the container whose height is animated */}
      <Animated.View style={animatedPopupStyle}>

        {activeNav && (
          <View >
            <BusLinePopUp />
            <BusStopPopUp />
            <Nearby />
            <Directions />
          </View>
        )}

      </Animated.View>

      {/* The Main Animated Navbar */}
      <Animated.View style={animatedNavbarStyle}>

        {/* The Arrow Button (Visible only when open) */}
        {activeNav && (
          <Pressable
            style={styles.arrowContainer}
            onPress={handleOnClick}
          >
            <Svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 448 512"
              style={styles.arrowIcon}
              fill="#333"
            >
              <Path d="M207.029 381.476L12.636 186.082c-19.167-19.167-19.167-50.33 0-69.497s50.329-19.167 69.497 0L224 290.793l141.867-174.208c19.167-19.167 50.329-19.167 69.497 0s19.167 50.329 0 69.497L241.029 381.476c-19.167 19.167-50.329 19.167-69.497 0z" />
            </Svg>
          </Pressable>
        )}

        <Navbtn
          icon={<Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style={styles.icon}><Path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM288 176c0-44.2-35.8-80-80-80s-80 35.8-80 80c0 48.8 46.5 111.6 68.6 138.6c6 7.3 16.8 7.3 22.7 0c22.1-27 68.6-89.8 68.6-138.6zm-112 0a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z" /></Svg>}
          label={"Nearby"}
          isActive={!activeNav}
        />
        <Navbtn
          icon={<Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={styles.icon}><Path d="m2.295 12.707 8.978 9c.389.39 1.025.391 1.414.002l9.021-9a1 1 0 0 0 0-1.416l-9.021-9a.999.999 0 0 0-1.414.002l-8.978 9a.998.998 0 0 0 0 1.412zm6.707-2.706h5v-2l3 3-3 3v-2h-3v4h-2v-6z" /><Path xmlns="http://www.w3.org/2000/svg" d="m2.295 12.707 8.978 9c.389.39 1.025.391 1.414.002l9.021-9a1 1 0 0 0 0-1.416l-9.021-9a.999.999 0 0 0-1.414.002l-8.978 9a.998.998 0 0 0 0 1.412zm6.707-2.706h5v-2l3 3-3 3v-2h-3v4h-2v-6z" /></Svg>}
          label={"Directions"}
          isActive={!activeNav}
        />
        <Navbtn
          icon={<Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={styles.icon}><Path d="M288 0C422.4 0 512 35.2 512 80l0 16 0 32c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l0 160c0 17.7-14.3 32-32 32l0 32c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-32-192 0 0 32c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-32c-17.7 0-32-14.3-32-32l0-160c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32c0 0 0 0 0 0l0-32s0 0 0 0l0-16C64 35.2 153.6 0 288 0zM128 160l0 96c0 17.7 14.3 32 32 32l112 0 0-160-112 0c-17.7 0-32 14.3-32 32zM304 288l112 0c17.7 0 32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-112 0 0 160zM144 400a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm288 0a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM384 80c0-8.8-7.2-16-16-16L208 64c-8.8 0-16 7.2-16 16s7.2 16 16 16l160 0c8.8 0 16-7.2 16-16z" /></Svg>}
          label={"Buses"}
          isActive={!activeNav}
        />
        <Navbtn
          icon={<Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style={styles.icon}><Path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" /></Svg>}
          label={"BusStops"}
          isActive={!activeNav}
        />
      </Animated.View>
    </>
  )
}

const styles = StyleSheet.create({

  popupContainer: {
    width: '100%',
    backgroundColor: '#F2EDE9',

    borderTopWidth: 5,
    borderTopColor: '#F2EDE9',

    borderLeftWidth: 2,
    borderLeftColor: 'black',
    borderRightWidth: 2,
    borderRightColor: 'black',
    
    zIndex: 10,
    overflow: 'hidden',
  },

  popupContent: {
    flex: 1,
  },

  navbarContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    minHeight: 60,
    position: 'absolute',
    backgroundColor: 'white',

    borderTopWidth: 2,
    borderTopColor: 'black',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,

    borderLeftWidth: 2,           
    borderLeftColor: 'black',    
    borderRightWidth: 2,          
    borderRightColor: 'black',    

    paddingLeft: 4,
    paddingRight: 4,
    zIndex: 20,

  },

  icon: {
    width: 20,
    height: 20,
  },

  arrowContainer: {
    position: 'absolute',
    top: -15,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 30,
    backgroundColor: 'white',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'black',
    zIndex: 25,
  },
  arrowIcon: {
    width: 15,
    height: 15,
  }
});