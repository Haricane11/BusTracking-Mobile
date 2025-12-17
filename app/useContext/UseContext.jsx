import { createContext, useContext, useState } from "react";

const MyContext = createContext();

// Renamed for clarity
export function ContextProvider({ children, busStopsContext = [], busLinesContext = [] }) {
  const [activeNav, setActiveNav] = useState(null);
  const [busStops, setBusStops] = useState(busStopsContext);
  const [busLines, setBusLines] = useState(busLinesContext);
  const [nearby, setNearby] = useState([]);
  const [specificBusStop, setSpecificBusStop] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [activeSearch, setActiveSearch] = useState(null);
  

  const contextValue = {
    activeNav,
    setActiveNav,
    busStops,
    busLines,
    nearby,
    specificBusStop,
    routeInfo,
    activeSearch,
    setBusStops,
    setBusLines,
    setNearby,
    setSpecificBusStop,
    setRouteInfo,
    setActiveSearch,
  };

  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  )
}

export const useMyContext = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useNavContext must be used within a MyContextProvider');
  }
  return context;
};