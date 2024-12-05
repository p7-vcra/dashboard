import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { Vessel } from "../types/vessel";
import { useMap } from "./MapContext";

interface VesselsContextType {
    vessels: { [mmsi: string]: Vessel };
    filtered: { [mmsi: string]: Vessel };
    setVessels: (newVessels: { [mmsi: string]: Vessel }) => void;
    filter: (vessel: Vessel) => boolean;
    setFilter: (predicate: (vessel: Vessel) => boolean) => void;
}

const VesselsContext = createContext<VesselsContextType | undefined>(undefined);

function VesselsProvider({ children }: { children: React.ReactNode }) {
    const [vessels, setVessels] = useState<{ [mmsi: string]: Vessel }>({});
    const [filter, setFilter] = useState<(vessel: Vessel) => boolean>(
        () => () => true
    );
    const [filtered, setFiltered] = useState<{ [mmsi: string]: Vessel }>({});

    const updateVessels = useCallback(
        (newVessels: { [mmsi: string]: Vessel }) => {
            setVessels((prevVessels) => {
                const updatedVessels = { ...prevVessels, ...newVessels };
                setFiltered(
                    Object.fromEntries(
                        Object.entries(updatedVessels).filter(([, vessel]) =>
                            filter(vessel)
                        )
                    )
                );
                return updatedVessels;
            });
        },
        [filter]
    );

    const updateFilter = useCallback(
        (predicate: (vessel: Vessel) => boolean) => {
            setFilter(() => predicate);
        },
        []
    );

    useEffect(() => {
        setFiltered(
            Object.fromEntries(
                Object.entries(vessels).filter(([, vessel]) => filter(vessel))
            )
        );
    }, [vessels, filter]);

    return (
        <VesselsContext.Provider
            value={{
                vessels,
                filtered,
                setVessels: updateVessels,
                filter,
                setFilter: updateFilter,
            }}
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
    const { vessels, setVessels, filtered } = useVessels();
    const { mapOptions } = useMap();
    const vesselsRef = useRef(vessels);
    vesselsRef.current = vessels;

    const baseUrl = import.meta.env.VITE_API_URL;
    const predictionEndpoint = import.meta.env.VITE_API_PREDICTION_ENDPOINT;

    useEffect(() => {
        const { bounds } = mapOptions;
        const params = new URLSearchParams(
            bounds
                ? {
                      latitude_range: `${bounds.south},${bounds.north}`,
                      longitude_range: `${bounds.west},${bounds.east}`,
                  }
                : {}
        );
        const url = new URL(`${baseUrl}${predictionEndpoint}`);
        url.search = params.toString();

        const eventSource = new EventSource(url);

        eventSource.onopen = () => console.log(`Opened connection to ${url}`);

        eventSource.addEventListener("ais", (event) => {
            const eventData: Vessel[] = JSON.parse(event.data, vesselReviver);

            const parsedData = eventData.reduce<{ [mmsi: string]: Vessel }>(
                (acc, vessel) => {
                    const { mmsi } = vessel;
                    acc[mmsi] = {
                        cri: parseFloat(Math.random().toFixed(2)), // Dummy data, remove later
                        ...vesselsRef.current[mmsi],
                        ...vessel,
                    };
                    return acc;
                },
                {}
            );
            setVessels(parsedData);
        });

        eventSource.addEventListener("prediction", (event) => {
            const eventData: Vessel[] = JSON.parse(
                event.data,
                predictionReviver
            );
            const parsedData = eventData.reduce(
                (
                    acc: { [mmsi: string]: Vessel },
                    vessel: Pick<Vessel, "mmsi" | "forecast">
                ) => {
                    const { mmsi, forecast } = vessel;
                    if (vesselsRef.current[mmsi]) {
                        acc[mmsi] = {
                            encounteringVessels: ["209535000", "211249810"],
                            ...vesselsRef.current[mmsi],
                            forecast,
                        };
                    }
                    return acc;
                },
                {}
            );

            setVessels(parsedData);
        });

        return () => {
            console.log(`Closing connection to ${url}`);
            eventSource.close();
        };
    }, [baseUrl, mapOptions, predictionEndpoint, setVessels]);

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
                    cog: item["cog"] || 0,
                    sog: item["sog"] || 0,
                    name: item["name"] || "",
                    timestamp: item["timestamp"],
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
    value: any
): Pick<Vessel, "mmsi" | "forecast">[] {
    if (Array.isArray(value)) {
        const groupedByMmsi: {
            [mmsi: string]: {
                timestamp: string;
                latitude: number;
                longitude: number;
            }[];
        } = {};

        value.forEach((item) => {
            if (typeof item === "object" && item !== null) {
                const mmsi = item["mmsi"];
                if (!groupedByMmsi[mmsi]) {
                    groupedByMmsi[mmsi] = [];
                }
                groupedByMmsi[mmsi].push({
                    timestamp: item["timestamp"],
                    latitude: item["latitude"],
                    longitude: item["longitude"],
                });
            }
        });

        return Object.entries(groupedByMmsi).map(([mmsi, forecast]) => ({
            mmsi,
            forecast: forecast.map(({ timestamp, latitude, longitude }) => [
                timestamp,
                latitude,
                longitude,
            ]),
        })) as Pick<Vessel, "mmsi" | "forecast">[];
    }
    return value;
}

export { useVesselData, useVessels, VesselsProvider };
