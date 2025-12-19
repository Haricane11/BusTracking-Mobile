import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, ScrollView, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useMyContext } from '../useContext/UseContext';

export default function Directions() {
    const { activeNav, busStops, activeSearch, setActiveSearch, setRouteInfo } = useMyContext();

    // Search states
    const [startQuery, setStartQuery] = useState("");
    const [endQuery, setEndQuery] = useState("");

    // Display states for the list
    const [displayedBusStops, setDisplayedBusStops] = useState([]);

    // ⭐ Route State ⭐
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [routeData, setRouteData] = useState(null);
    const [routeError, setRouteError] = useState(null);
    // ⭐ NEW STATE: Stores the detailed, filtered route for display
    const [selectedRouteStops, setSelectedRouteStops] = useState(null);

    const BATCH_SIZE = 500;

    // Determine the currently used query and its setter
    const currentQuery = activeSearch === 'start' ? startQuery : endQuery;
    const setCurrentQuery = activeSearch === 'start' ? setStartQuery : setEndQuery;

    // Use a unified query that only matters if a search input is active
    const queryToFilter = activeSearch ? currentQuery : "";

    const port = process.env.EXPO_PUBLIC_API_URL;

    const fetchBusLineInfo = useCallback(async (startBusStopName, endBusStopName) => {
        const url = `${port}/routeInfo`;


        setRouteError(null);
        setIsCalculatingRoute(true);
        setRouteData(null); // Clear previous route data
        setSelectedRouteStops(null); // Clear selected route when a new calculation starts
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    startingBusStop: startBusStopName,
                    endingBusStop: endBusStopName
                }),
            });

            if (!res.ok) {
                const errorDetail = res.status === 404
                    ? "No route found between these stops."
                    : `Server Error: ${res.status}`;
                throw new Error(errorDetail);
            }

            const data = await res.json();
            return data;

        } catch (error) {
            console.error("Error fetching bus line data:", error);
            throw error;
        } finally {
            setIsCalculatingRoute(false);
        }
    }, []);



    useEffect(() => {
        // Clear selected route view if user modifies queries
        if (startQuery.trim() !== "" || endQuery.trim() !== "") {
            setSelectedRouteStops(null);
        }

        if (startQuery.trim() !== "" && endQuery.trim() !== "" && activeSearch === null) {
            const getRoute = async () => {
                try {
                    const result = await fetchBusLineInfo(startQuery, endQuery);
                    setRouteData(result);
                } catch (err) {
                    setRouteError(err.message);
                }
            };
            getRoute();
        } else if (activeSearch !== null) {
            setRouteData(null);
            setRouteError(null);
        }
    }, [startQuery, endQuery, activeSearch, fetchBusLineInfo]);

    // Effect to update the initially displayed batch when the active query changes
    useEffect(() => {
        if (activeSearch) {
            setDisplayedBusStops(currentlyFilteredList.slice(0, BATCH_SIZE));
        }
        else {
            // Clear the list if no input is active
            setDisplayedBusStops([]);
        }
    }, [queryToFilter, filterBusStops, activeSearch, currentlyFilteredList]);

    // Inside your component, use useMemo to deduplicate the list
    const uniqueBusStops = useMemo(() => {
        // 1. Create a Map to track unique IDs
        const uniqueMap = new Map();

        // 2. Iterate through the bus stops
        for (const stop of busStops) {
            // If the ID is not yet in the map, add the entire object.
            // If it is, we skip it.
            if (stop.id && !uniqueMap.has(stop.id)) {
                uniqueMap.set(stop.id, stop);
            }
        }
        // 3. Convert the map values back to an array for the FlatList data prop
        return Array.from(uniqueMap.values());
    }, [busStops]); 
    
    const filterBusStops = useCallback((stops, query) => {
        if (!query) return stops;
        const lowerQuery = query.toLowerCase();
        return stops.filter(stop => {

            const nameEn = stop.name_en ? stop.name_en.toLowerCase() : '';
            const nameMm = stop.name_mm ? stop.name_mm.toLowerCase() : '';

            return nameEn.includes(lowerQuery) || nameMm.includes(lowerQuery);
        });
    }, []); 

    // Memoize the full filtered list based on the active query
    const currentlyFilteredList = useMemo(
        () => filterBusStops(uniqueBusStops, queryToFilter),
        [uniqueBusStops, queryToFilter, filterBusStops]
    );


    // Infinite scrolling logic
    const handleLoadMore = useCallback(() => {
        const nextIndex = displayedBusStops.length;
        const totalFilteredLength = currentlyFilteredList.length;
        if (nextIndex < totalFilteredLength) {
            setDisplayedBusStops((prev) => [
                ...prev,
                ...currentlyFilteredList.slice(nextIndex, nextIndex + BATCH_SIZE),
            ]);
        }
    }, [currentlyFilteredList, displayedBusStops.length, BATCH_SIZE]);

    // Swap button logic
    const handleSwap = () => {
        const temp = startQuery;
        setStartQuery(endQuery);
        setEndQuery(temp);
    };



    const handleSearchSubmit = () => {
        if (activeSearch && currentlyFilteredList.length > 0) {
            const firstStop = currentlyFilteredList[0];
            setCurrentQuery(firstStop.name_en);
            setActiveSearch(null);
        }
    };

    const handleRouteOnClick = () => {
        if (!routeData || !Array.isArray(routeData) || routeData.length === 0) {
            return;
        }

        // 1. Calculate unique lines and find the first one (lowest ID)
        const uniqueLines = routeData.reduce((acc, current) => {
            if (current.bus_line_id && !acc.includes(current.bus_line_id)) {
                acc.push(current.bus_line_id);
            }
            return acc;
        }, []).sort((a, b) => a - b); // Sort numerically (e.g., [35, 37, 61])

        const firstBusLineId = uniqueLines[0];

        if (firstBusLineId) {
            
            const detailedRoute = routeData.filter(stop => stop.bus_line_id === firstBusLineId);

            // Store the filtered route in the new state to trigger the detailed view
            setSelectedRouteStops(detailedRoute);

            // Update the context state here in the event handler (safe)
            setRouteInfo(detailedRoute);
        }
    }

    const handleBackOption = () => {
        setSelectedRouteStops(null);
        setRouteInfo(null)
    }

    // change context according to result by searching route
    let context;
    if (!selectedRouteStops && routeData && Array.isArray(routeData) && routeData.length > 0) {
        const uniqueLines = routeData.reduce((acc, current) => {
            if (current.bus_line_id && !acc.includes(current.bus_line_id)) {
                acc.push(current.bus_line_id);
            }
            return acc;
        }, []).sort((a, b) => a - b);

        const busLineDisplay = uniqueLines.join(', ');

        context = (
            <View style={styles.routeOptionContainer}>
                <Text style={{ fontWeight: "bold", color: "#10B981", fontSize: 20 }}>✅ Route Options Found!</Text>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ color: "#4d5258ff", fontWeight: "bold" }}>From: **{startQuery}**</Text>
                    <Text style={{ color: "#6b7280" }}>{" ----> "}</Text>
                    <Text style={{ color: "#4d5258ff", fontWeight: "bold" }}>To: **{endQuery}**</Text>
                </View>
                <View style={styles.busLineInfoContainer}>
                    <Text style={{ color: "#4d5258ff", fontWeight: "bold" }}>🚌 Available Bus Lines:</Text>
                    <Text style={styles.busLineInfo}>{busLineDisplay}</Text>
                    <Text style={{ color: "#4d5258ff", fontSize: 11 }}>Click below to display the detailed route steps and bus line path.</Text>
                    <TouchableOpacity
                        onPress={handleRouteOnClick}
                        style={styles.detailRouteBtn}>
                        <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>View Detailed Route</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    } else if (isCalculatingRoute) {
        context = (
            <View style={{ marginTop: 100 }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        )
    } else if (selectedRouteStops) {
        context = (
            <View style={styles.detailedRouteContainer}>
                <View style={{ gap: 10, paddingBottom: 10 }}>
                    <Text style={{ color: "#1D4ED8", fontWeight: "bold", fontSize: 20 }}>🗺️ Detailed Route</Text>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ color: "#4d5258ff", fontWeight: "bold" }}>From: **{startQuery}**</Text>
                        <Text style={{ color: "#6b7280" }}>{" ----> "}</Text>
                        <Text style={{ color: "#4d5258ff", fontWeight: "bold" }}>To: **{endQuery}**
                        </Text>
                    </View>
                </View>

                <View style={styles.stopSequenceContainer}>
                    <Text style={{ fontWeight: "bold" }}>Stop Sequence:</Text>
                    <ScrollView style={{
                        maxHeight: 70,
                        paddingRight: 10,
                    }}>
                        {selectedRouteStops.map((stop,index) => (
                            <Text style={{color: "#6b7280"}} key={index}>{index+1}{". "} {stop.name_en} ({stop.name_mm})</Text>    
                        ))}
                    </ScrollView>
                    <TouchableOpacity 
                        onPress={handleBackOption}
                        style={styles.backButton}>
                        <Text style={{ fontWeight: "bold", color: "#6b7280", fontSize: 15 }}>Back to Options</Text>
                    </TouchableOpacity>
                </View>

            </View>
        )

    } else if (routeData && startQuery !== "" && endQuery !== "") {
        context = (
                          <View style={{backgroundColor: "#FEF9C3", padding: 10, gap: 10}}>
                <Text style={{color: "#A16207", fontWeight: "bold", fontSize: 15}}>⚠️ No Direct Route Found</Text>
                <Text style={{color: "#A16207"}}>Try swapping your start/end points or searching for alternate stops.</Text>
            </View>
        )
    } else if (startQuery === "" && endQuery === ""){
        context = (
            // Preview text 
            <View style={styles.previewContainer}>
                <View>
                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={styles.busStopIcon}>
                        <Path fill={"#6b7280"} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                    </Svg>
                </View>
                <Text style={{ fontWeight: "bold", color: "#6b7280" }}>Ready for Directions </Text>
                <Text style={{ fontWeight: "bold", color: "#6b7280", textAlign: "center" }}>Enter **Start** and **End** locations to plan your route.</Text>
            </View>
        )
    }

    const renderItem = ({ item }) => {
        const handleSelectStop = () => {
            setCurrentQuery(item.name_en);
            setActiveSearch(null);
        };

        return (
            <TouchableOpacity
                onPress={handleSelectStop}
                style={styles.container}
            >
                {/* Bus Stop Icon */}
                <View style={styles.busStopIconContainer}>
                    <Svg style={styles.busStopIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" >
                        <Path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                    </Svg>
                </View>
                {/* Text Details */}
                <View style={styles.textContainer}>
                    <Text style={{ color: item.color, fontWeight: "bold" }}>{item.name_en} ( {item.name_mm} )</Text>
                    <Text>{item.road_en}{", "}{item.township_en}</Text>
                    <Text>{item.road_mm}{", "}{item.township_mm}</Text>
                </View>
                {/* Arrow Icon */}
                <View>
                    <Svg style={styles.arrowIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </Svg>
                </View>
            </TouchableOpacity>
        )
    }


    const hasMoreToLoad = currentlyFilteredList.length > displayedBusStops.length;
    // Condition to show the search results list
    const shouldShowList = activeSearch && queryToFilter.length > 0;
    return (
        activeNav === 'Directions' ? (
            <View>
                {/* Search Inputs */}
                <View style={styles.searchContainer}>
                    <View style={styles.inputBoxContainer}>
                        {/* Start Input */}
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Start bus stop... "
                            onFocus={() => setActiveSearch("start")}
                            onBlur={() => {
                                if (activeSearch === "start") setActiveSearch(null);
                            }}
                            onChangeText={setStartQuery}
                            onSubmitEditing={handleSearchSubmit}
                            value={startQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                        />
                        {/* End Input */}
                        <TextInput
                            style={styles.searchInput}
                            placeholder="End bus stop... "
                            onFocus={() => setActiveSearch("end")}
                            onBlur={() => {
                                if (activeSearch === "end") setActiveSearch(null);
                            }}
                            onChangeText={setEndQuery}
                            onSubmitEditing={handleSearchSubmit}
                            value={endQuery}
                            autoCapitalize="none"
                            autoCorrect={false}
                            returnKeyType="search"
                            clearButtonMode="while-editing"
                        />
                    </View>
                </View>

                {/* Swap Button */}
                <TouchableOpacity
                    onPress={handleSwap}
                    style={styles.toggleIcon}>
                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" data-slot="icon" width={20} height={20}>
                        <Path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd"></Path>
                    </Svg>
                </TouchableOpacity>

                {/* List of Filtered Bus Stops */}
                {shouldShowList ? (
                    <View style={{ borderTopColor: "#D1D5DB", borderTopWidth: 1 }}>
                        {currentlyFilteredList.length > 0 ? (
                            <FlatList
                                style={styles.list}
                                onEndReached={handleLoadMore}
                                onEndReachedThreshold={0.5}
                                contentContainerStyle={styles.contentContainer}
                                data={displayedBusStops}
                                renderItem={renderItem}
                                keyExtractor={(item, index) => index}
                                ListFooterComponent={hasMoreToLoad ? <Text style={{ textAlign: 'center', padding: 10 }}>Loading...</Text> : null}
                            />
                        ) : (
                            <View style={styles.noResultsContainer}>
                                <View>
                                    <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={styles.busStopIcon}>
                                        <Path fill={"#6b7280"} d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                                    </Svg>
                                </View>
                                <Text style={styles.noResultsText}>
                                    No Stops Match &quot;{queryToFilter}&quot;
                                </Text>
                                <Text style={styles.noResultsText}>
                                    Try searching for a different stop name
                                </Text>
                                <Text style={styles.noResultsText}>
                                    (English or Myanmar).
                                </Text>
                            </View>
                        )}
                    </View>
                ) : (
                    <View style={{ padding: 7 }}>
                        {context}
                    </View>
                )}
            </View>
        ) : (
            <View />
        )
    );
}

const styles = StyleSheet.create({

    // for list 
    container: {
        flexDirection: "row",
        gap: 20,
        alignItems: "center",
        padding: 20,
        backgroundColor: "white",
        marginTop: 7,
        marginBottom: 7,
        borderRadius: 10,
    },
    busStopIconContainer: {
        backgroundColor: "#F2EDE9",
        borderRadius: 20,
        padding: 10
    },
    busStopIcon: {
        width: 20,
        height: 20,
    },
    textContainer: {
        flex: 1,
        gap: 10,
        padding: 1,
    },
    arrowIcon: {
        width: 20,
        height: 20,
        color: "#6366f1",
    },
    list: {
        padding: 10,
    },
    contentContainer: {
        // This is the key. Add enough padding to clear the bottom navigation/tab bar.
        paddingBottom: 200,
    },

    // for search box
    searchContainer: {
        flexDirection: "row",
        width: "70%",
        gap: 10,
        padding: 10,
        backgroundColor: '#F2EDE9',
    },
    inputBoxContainer: {
        width: 280,
        gap: 10,
    },
    searchInput: {
        height: 40,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    toggleIcon: {
        position: "absolute",
        top: 30,
        right: 20,
        width: 40,
        height: 40,
        backgroundColor: "white",
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },

    // for preview context, noResult context
    previewContainer: {
        marginTop: 50,
        alignItems: "center",
        gap: 7,
    },
    noResultsContainer: {
        flexDirection: "column",
        textAlign: "center",
        alignItems: "center",
        gap: 7,
        paddingTop: 100,
    },
    noResultsText: {
        color: "#6b7280",
        fontWeight: "bold",
        fontSize: 15,
    },

    // for route options found and busLine data
    routeOptionContainer: {
        borderColor: "#10B981",
        borderWidth: 2,
        borderRadius: 10,
        gap: 12,
        padding: 10,
        backgroundColor: "white",
    },
    busLineInfoContainer: {
        borderColor: "black",
        borderTopWidth: 1,
        paddingTop: 10,
        gap: 10,
    },
    busLineInfo: {
        textAlign: "center",
        padding: 10,
        backgroundColor: "#EFF6FF",
        color: "#2563EB",
        fontWeight: "bold",
        fontSize: 20,
    },
    detailRouteBtn: {
        backgroundColor: "#33b78bff",
        borderRadius: 7,
        alignItems: "center",
        padding: 15,
    },

    // for detailed route context
    detailedRouteContainer: {
        borderWidth: 2,
        borderColor: "#3B82F6",
        borderRadius: 10,
        padding: 10,
    },
    stopSequenceContainer: {
        borderTopWidth: 1,
        borderColor: "black",
        gap: 12,
        paddingTop: 10,
    },
    backButton: {
        marginTop: 7,
        borderColor: "#D1D5DB",
        borderWidth: 2,
        borderRadius: 7,
        alignItems: "center",
        padding: 15,
    },
})