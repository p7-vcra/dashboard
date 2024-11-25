import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Vessel } from "../types/vessel";
import { useMapOptions } from "./MapOptionsContext";

interface VesselsContextType {
    vessels: { [mmsi: string]: Vessel };
    filtered: { [mmsi: string]: Vessel };
    updateVessels: (newVessels: { [mmsi: string]: Vessel }) => void;
    filter: (vessel: Vessel) => boolean;
    updateFilter: (predicate: (vessel: Vessel) => boolean) => void;
}

const VesselsContext = createContext<VesselsContextType | undefined>(undefined);

function VesselsProvider({ children }: { children: React.ReactNode }) {
    const [vessels, setVessels] = useState<{ [mmsi: string]: Vessel }>({});
    const [filter, setFilter] = useState<(vessel: Vessel) => boolean>(
        () => () => true,
    );
    const [filtered, setFiltered] = useState<{ [mmsi: string]: Vessel }>({});

    const updateVessels = useCallback(
        (newVessels: { [mmsi: string]: Vessel }) => {
            setVessels((prevVessels) => {
                const updatedVessels = { ...prevVessels, ...newVessels };
                setFiltered(
                    Object.fromEntries(
                        Object.entries(updatedVessels).filter(([, vessel]) =>
                            filter(vessel),
                        ),
                    ),
                );
                return updatedVessels;
            });
        },
        [filter],
    );

    const updateFilter = useCallback(
        (predicate: (vessel: Vessel) => boolean) => {
            setFilter(() => predicate);
        },
        [],
    );

    useEffect(() => {
        setFiltered(
            Object.fromEntries(
                Object.entries(vessels).filter(([, vessel]) => filter(vessel)),
            ),
        );
    }, [vessels, filter]);

    return (
        <VesselsContext.Provider
            value={{ vessels, filtered, updateVessels, filter, updateFilter }}
        >
            {children}
        </VesselsContext.Provider>
    );
}

function useVessels() {
    const context = useContext(VesselsContext);
    if (!context) {
        throw new Error("useVessels must be used within a VesselsProvider");
    }
    return context;
}

function useVesselData() {
    const { vessels, updateVessels, filtered } = useVessels();
    const { mapOptions } = useMapOptions();
    const vesselsRef = useRef(vessels);
    vesselsRef.current = vessels;

    const baseUrl = "http://130.225.37.58:8000";

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const { bounds } = mapOptions;
            const url = bounds
                ? `${baseUrl}/slice?latitude_range=${bounds.south},${bounds.north}&longitude_range=${bounds.west},${bounds.east}`
                : `${baseUrl}/dummy-ais-data`;

            const eventSource = new EventSource(url);
            eventSource.onopen = () =>
                console.log(`Opened connection to ${url}`);

            eventSource.addEventListener("ais", (event) => {
                const eventData: Vessel[] = JSON.parse(
                    event.data,
                    vesselReviver,
                );
                const parsedData = eventData.reduce(
                    (acc: { [mmsi: string]: Vessel }, vessel: Vessel) => {
                        const { mmsi, vesselType } = vessel;

                        if (vesselType === "Class A") {
                            acc[mmsi] = {
                                cri: parseFloat(Math.random().toFixed(2)),
                                ...vesselsRef.current[mmsi],
                                ...vessel,
                            };
                        }
                        return acc;
                    },
                    {},
                );
                console.log("Received AIS data");
                updateVessels(parsedData);
            });

            return () => {
                eventSource.close();
            };
        }, 1000);

        return () => {
            clearTimeout(timeoutId);
        };
    }, [mapOptions, updateVessels]);

    useEffect(() => {
        const futureVesselEventSource = new EventSource(
            `${baseUrl}/dummy-prediction`,
        );

        futureVesselEventSource.onopen = () =>
            console.log("Future Vessel course connection opened");

        futureVesselEventSource.addEventListener("ais", (event) => {
            const eventData = JSON.parse(event.data, predictionReviver);

            const vesselPredictions = eventData.reduce(
                (
                    acc: { [mmsi: string]: number[][] },
                    prediction: Pick<Vessel, "mmsi" | "latitude" | "longitude">,
                ) => {
                    const { mmsi, latitude, longitude } = prediction;
                    if (!acc[mmsi]) {
                        acc[mmsi] = [];
                    }
                    acc[mmsi].push([latitude, longitude]);
                    return acc;
                },
                {},
            );
            const updatedVessels = Object.entries(vesselPredictions).reduce(
                (acc: { [mmsi: string]: Vessel }, [mmsi, predictions]) => {
                    if (vesselsRef.current[mmsi]) {
                        acc[mmsi] = {
                            ...vesselsRef.current[mmsi],
                            futureLocation: (
                                predictions as [number, number][]
                            ).slice(1),
                        };
                    }
                    return acc;
                },
                {},
            );

            updateVessels(updatedVessels);
        });

        return () => {
            futureVesselEventSource.close();
        };
    }, [updateVessels]);

    return { vessels, filtered };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function vesselReviver(_key: string, value: any): Vessel[] | never {
    if (Array.isArray(value)) {
        return value.map((item) => {
            if (typeof item === "object" && item !== null) {
                return {
                    mmsi: item["mmsi"],
                    vesselType: item["type of mobile"],
                    latitude: item["latitude"],
                    longitude: item["longitude"],
                    cog: item["cog"],
                    sog: item["sog"],
                    name: item["name"] || "",
                } as Vessel;
            }
            return item;
        });
    }
    return value;
}
function predictionReviver(
    _key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
): Pick<Vessel, "mmsi" | "latitude" | "longitude">[] {
    if (Array.isArray(value)) {
        return value.map((item) => {
            if (typeof item === "object" && item !== null) {
                return {
                    mmsi: item["mmsi"],
                    latitude: item["latitude"],
                    longitude: item["longitude"],
                };
            }
            return item;
        });
    }
    return value;
}

export { useVesselData, useVessels, VesselsProvider };
