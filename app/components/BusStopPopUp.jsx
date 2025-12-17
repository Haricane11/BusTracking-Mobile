import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import Svg, { Path } from 'react-native-svg';
import { useMyContext } from '../useContext/UseContext'

export default function BusStopPopUp() {
    const { activeNav, busStops, setSpecificBusStop } = useMyContext();
    const [displayedBusStops, setDisplayedBusStops] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const BATCH_SIZE = 300;

    const filterBusStops = React.useCallback((stops, query) => {
        if (!query) return stops;
        const lowerQuery = query.toLowerCase();
        return stops.filter(stop => {
            const nameEn = stop.name_en ? stop.name_en.toLowerCase() : '';
            const nameMm = stop.name_mm ? stop.name_mm.toLowerCase() : '';
            return nameEn.includes(lowerQuery) || nameMm.includes(lowerQuery);
        });
    }, []);

    useEffect(() => {
        const filtered = filterBusStops(busStops, searchQuery);
        setDisplayedBusStops(filtered.slice(0, BATCH_SIZE));
    }, [searchQuery, busStops, filterBusStops]);

    const currentlyFilteredList = React.useMemo(
        () => filterBusStops(busStops, searchQuery),
        [busStops, searchQuery, filterBusStops]
    );


    const handleLoadMore = React.useCallback(() => {
        const nextIndex = displayedBusStops.length;
        const totalFilteredLength = currentlyFilteredList.length;
        if (nextIndex < totalFilteredLength) {
            setDisplayedBusStops((prev) => [
                ...prev,
                ...currentlyFilteredList.slice(nextIndex, nextIndex + BATCH_SIZE),
            ]);
        }
    }, [currentlyFilteredList, displayedBusStops.length, BATCH_SIZE]);

    const handleSearch = (text) => {
        setSearchQuery(text);
    };


    const hasMoreToLoad = currentlyFilteredList.length > displayedBusStops.length;

    const renderItem = ({ item }) => {

        return (
            <TouchableOpacity
                onPress={() => setSpecificBusStop(item)}
                style={styles.container}
            >
                <View>
                    <View style={styles.busStopIconContainer}>
                        <Svg
                            style={styles.busStopIcon}
                            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" >
                            <Path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                        </Svg>
                    </View>
                </View>
                <View style={styles.textContainer}>
                    <Text style={{ color: item.color, fontWeight: "bold" }}>{item.name_en} {"("} {item.name_mm} {")"}</Text>
                    <Text>{item.road_en}{", "}{item.township_en}</Text>
                    <Text>{item.road_mm}{", "}{item.township_mm}</Text>
                </View>
                <View>
                    <Svg 
                        style={styles.arrowIcon}
                        xmlns="http://www.w3.org/2000/svg"  fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </Svg>
                </View>
            </TouchableOpacity>
        )

    }
    return (
        activeNav === 'BusStops' ? (


            <View style={styles.busStopsContentWrapper}>
                {/* Search */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search bus stop (English or Myanmar)... "
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                        onChangeText={handleSearch}
                    />
                </View>
                
                {/* list */}
                {currentlyFilteredList.length > 0 ? (

                    <FlatList
                        style={styles.list}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        contentContainerStyle={styles.contentContainer}
                        data={displayedBusStops}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        ListFooterComponent={hasMoreToLoad ? <Text style={{ textAlign: 'center', padding: 10 }}>Loading...</Text> : null}
                    />
                ) : (
                    <View style={styles.noResultsContainer}>
                        <View>
                            <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={[
                                styles.busStopIcon,
                            ]}
                            ><Path
                                    fill={"#6b7280"}
                                    d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z" />
                            </Svg>
                        </View>
                        <Text style={styles.noResultsText}>
                            No Stops Match &quot;{searchQuery}&quot;
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
            <View />
        )

    )
}

const styles = StyleSheet.create({
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

    searchContainer: {
        padding: 10,
        backgroundColor: '#F2EDE9',
    },
    searchInput: {
        height: 40,
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#ccc',
    },

    contentContainer: {
        // This is the key. Add enough padding to clear the bottom navigation/tab bar.
        paddingBottom: 150,
    },

    list: {
        padding: 10,
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
    }



})