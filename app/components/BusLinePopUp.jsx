import React, { useEffect, useRef, useState } from 'react'
import { View, ScrollView, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg';
import { useMyContext } from '../useContext/UseContext'

export default function BusLinePopUp() {
    const { activeNav, busLines } = useMyContext();
    const [displayedBuses, setDisplayedBuses] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewRouteActive, setViewRouteActive] = useState(null)

    const BATCH_SIZE = 10;

    const filterBusLines = React.useCallback((lines, query) => {
        if (!query) return lines;
        const lowerQuery = query.toLowerCase();
        return lines.filter(line => {
            const lineNumber = String(line.line_number || '').toLowerCase();
            const lineId = String(line.id || '').toLowerCase(); // Include ID in search logic
            return lineNumber.includes(lowerQuery) || lineId.includes(lowerQuery);
        });
    }, []);

    useEffect(() => {
        const filtered = filterBusLines(busLines, searchQuery);
        setDisplayedBuses(filtered.slice(0, BATCH_SIZE));
    }, [searchQuery, busLines, filterBusLines]);

    const currentlyFilteredList = React.useMemo(
        () => filterBusLines(busLines, searchQuery),
        [busLines, searchQuery, filterBusLines]
    );


    const handleLoadMore = React.useCallback(() => {
        const nextIndex = displayedBuses.length;
        const totalFilteredLength = currentlyFilteredList.length;
        if (nextIndex < totalFilteredLength) {
            setDisplayedBuses((prev) => [
                ...prev,
                ...currentlyFilteredList.slice(nextIndex, nextIndex + BATCH_SIZE),
            ]);
        }
    }, [currentlyFilteredList, displayedBuses.length, BATCH_SIZE]);

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const formatedRouteStop = (route) => {
        return route.split('-').map(stop => stop.trim())
    }

    const hasMoreToLoad = currentlyFilteredList.length > displayedBuses.length;

    const renderItem = ({ item }) => {
        const isExpanded = item.id === viewRouteActive;

        return (
            <View style={styles.container}>
                <View>
                    <View style={styles.busIconContainer}>
                        <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={[
                            styles.busIcon,

                        ]}
                        ><Path
                                fill={item.color}
                                d="M288 0C422.4 0 512 35.2 512 80l0 16 0 32c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l0 160c0 17.7-14.3 32-32 32l0 32c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-32-192 0 0 32c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-32c-17.7 0-32-14.3-32-32l0-160c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32c0 0 0 0 0 0l0-32s0 0 0 0l0-16C64 35.2 153.6 0 288 0zM128 160l0 96c0 17.7 14.3 32 32 32l112 0 0-160-112 0c-17.7 0-32 14.3-32 32zM304 288l112 0c17.7 0 32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-112 0 0 160zM144 400a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm288 0a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM384 80c0-8.8-7.2-16-16-16L208 64c-8.8 0-16 7.2-16 16s7.2 16 16 16l160 0c8.8 0 16-7.2 16-16z" />
                        </Svg>
                    </View>
                </View>
                <View style={styles.textContainer}>
                    <Text style={{ color: item.color, fontWeight: "bold" }}>Bus line: {item.id}</Text>
                    <Text>station: {item.station}</Text>
                    <Text>Start: {item.start}</Text>
                    <Text>End: {item.end}</Text>
                    <TouchableOpacity
                        onPress={() => setViewRouteActive(isExpanded ? null : item.id)}
                        style={styles.viewRouteContainer}>
                        <View style={styles.arrowIconContainer}>
                            <Svg
                                style={[styles.arrowIcon, {
                                    transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                                }]}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="#6366f1"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <Path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </Svg>
                        </View>
                        <Text style={styles.viewRoute}>
                            View Route {"("}{formatedRouteStop(item.named_route).length}{" stops)"}
                        </Text>
                    </TouchableOpacity>
                    {isExpanded &&
                        <ScrollView style={styles.stopsScrollView} nestedScrollEnabled={true}>
                            {formatedRouteStop(item.named_route).map((routeName, index) => (
                                <View style={styles.routeNameContainer} key={index}>
                                    <Text>
                                        {'\u2022'}
                                    </Text>
                                    <Text>

                                        {routeName}
                                    </Text>
                                </View>

                            ))}
                        </ScrollView>
                    }
                </View>

            </View>
        )

    }
    return (
        activeNav === 'Buses' ? (

            <View style={styles.busContentWrapper}>
                {/* Search */}
                <View style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by bus line number..."
                        autoCapitalize="none"
                        autoCorrect={false}
                        returnKeyType="search"
                        clearButtonMode="while-editing"
                        onChangeText={handleSearch}
                    />
                </View>
                {/* List */}
                {currentlyFilteredList.length > 0 ? (
                    <FlatList
                        style={styles.list}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        contentContainerStyle={styles.contentContainer}
                        data={displayedBuses}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        ListFooterComponent={hasMoreToLoad ? <Text style={styles.loadingText}>Loading...</Text> : null}
                    />
                ) : (
                    <View style={styles.noResultsContainer}>
                        <View>
                            <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" style={[
                                styles.busIcon,
                            ]}
                            ><Path
                                    fill={"#6b7280"}
                                    d="M288 0C422.4 0 512 35.2 512 80l0 16 0 32c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32l0 160c0 17.7-14.3 32-32 32l0 32c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-32-192 0 0 32c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-32c-17.7 0-32-14.3-32-32l0-160c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32c0 0 0 0 0 0l0-32s0 0 0 0l0-16C64 35.2 153.6 0 288 0zM128 160l0 96c0 17.7 14.3 32 32 32l112 0 0-160-112 0c-17.7 0-32 14.3-32 32zM304 288l112 0c17.7 0 32-14.3 32-32l0-96c0-17.7-14.3-32-32-32l-112 0 0 160zM144 400a32 32 0 1 0 0-64 32 32 0 1 0 0 64zm288 0a32 32 0 1 0 0-64 32 32 0 1 0 0 64zM384 80c0-8.8-7.2-16-16-16L208 64c-8.8 0-16 7.2-16 16s7.2 16 16 16l160 0c8.8 0 16-7.2 16-16z" />
                            </Svg>
                        </View>
                        <Text style={styles.noResultsText}>
                            No Buses Match &quot;{searchQuery}&quot;
                        </Text>
                        <Text style={styles.noResultsText}>
                            Try searching for a different line number.
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

    busIconContainer: {
        backgroundColor: "#F2EDE9",
        borderRadius: 20,
        padding: 10
    },
    busIcon: {
        width: 20,
        height: 20,
    },

    textContainer: {
        gap: 10,
    },

    arrowIconContainer: {
        width: 25,
        padding: 3,

    },

    arrowIcon: {
        width: 20,
        height: 20,
        color: "#6366f1",
    },

    viewRouteContainer: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },

    viewRoute: {
        color: "#6366f1",
    },

    routeNameContainer: {
        borderLeftWidth: 2,
        borderLeftColor: "#d1d5db",
        paddingLeft: 7,
        borderStyle: "dashed",
        flexDirection: "row",
        gap: 7,
    },

    stopsScrollView: {
        maxHeight: 100,
        paddingRight: 10,
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