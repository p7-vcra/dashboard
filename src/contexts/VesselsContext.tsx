import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { EncounteringVessel, ForecastPoint, Vessel, VesselEncounter, VesselForecast } from "../types/vessel";
import { useMap } from "./MapContext";

interface VesselsContextType {
    vessels: { [mmsi: string]: Vessel };
    filtered: { [mmsi: string]: Vessel };
    setFilter: (predicate: (vessel: Vessel) => boolean) => void;
}

const VesselsContext = createContext<VesselsContextType | undefined>(undefined);

function VesselsProvider({ children }: { children: React.ReactNode }) {
    const [vessels, setVessels] = useState<{ [mmsi: string]: Vessel }>({});
    const [filter, setFilter] = useState<(vessel: Vessel) => boolean>(() => () => true);
    const [filtered, setFiltered] = useState<{ [mmsi: string]: Vessel }>({});

    const updateVessels = useCallback(
        (newVessels: { [mmsi: string]: Vessel }) => {
            setVessels((prevVessels) => {
                const updatedVessels = { ...prevVessels, ...newVessels };
                setFiltered(Object.fromEntries(Object.entries(updatedVessels).filter(([, vessel]) => filter(vessel))));
                return updatedVessels;
            });
        },
        [filter],
    );

    const updateFilter = useCallback((predicate: (vessel: Vessel) => boolean) => {
        setFilter(() => predicate);
    }, []);

    useEffect(() => {
        setFiltered(Object.fromEntries(Object.entries(vessels).filter(([, vessel]) => filter(vessel))));
    }, [vessels, filter]);

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
                : {},
        );
        const url = new URL(`${baseUrl}${predictionEndpoint}`);
        url.search = params.toString();

        const eventSource = new EventSource(url);

        eventSource.onopen = () => console.log(`Opened connection to ${url}`);

        eventSource.addEventListener("ais", (event) => {
            const eventData: Vessel[] = JSON.parse(event.data, vesselReviver);

            const parsedData = eventData.reduce<{ [mmsi: string]: Vessel }>((acc, vessel) => {
                const { mmsi } = vessel;
                acc[mmsi] = {
                    ...vesselsRef.current[mmsi],
                    ...vessel,
                };
                return acc;
            }, {});
            updateVessels(parsedData);
        });

        eventSource.addEventListener("prediction", (event) => {
            const eventData: VesselForecast[] = JSON.parse(event.data, predictionReviver);
            const parsedData = eventData.reduce((acc: { [mmsi: string]: Vessel }, vessel: VesselForecast) => {
                const { mmsi, forecast } = vessel;
                if (vesselsRef.current[mmsi]) {
                    const validForecast = forecast?.filter(
                        (point) =>
                            new Date(point.timestamp).getTime() >
                            new Date(vesselsRef.current[mmsi].timestamp).getTime() - 60 * 1000, // 1 minute
                    );
                    acc[mmsi] = {
                        ...vesselsRef.current[mmsi],
                        forecast: validForecast,
                    };
                }
                return acc;
            }, {});

            updateVessels(parsedData);
        });
        const handleEncounterEvent = (event: MessageEvent, isFutureCri: boolean) => {
            const eventData: VesselEncounter[] = JSON.parse(event.data, enounterReviver);

            const parsedData = eventData.reduce<{
                [mmsi: string]: EncounteringVessel[];
            }>((acc, encounter) => {
                const { vessel1, vessel2 } = encounter;
                if (vesselsRef.current[vessel1.mmsi]) {
                    if (!acc[vessel1.mmsi]) {
                        acc[vessel1.mmsi] = [];
                    }
                    acc[vessel1.mmsi].push({
                        mmsi: vessel2.mmsi,
                        ...encounter,
                        isFutureCri,
                    });
                }
                if (vesselsRef.current[vessel2.mmsi]) {
                    if (!acc[vessel2.mmsi]) {
                        acc[vessel2.mmsi] = [];
                    }
                    acc[vessel2.mmsi].push({
                        mmsi: vessel1.mmsi,
                        ...encounter,
                        isFutureCri,
                    });
                }
                return acc;
            }, {});

            const updatedVessels = Object.entries(vessels).reduce<{
                [mmsi: string]: Vessel;
            }>((acc, [mmsi]) => {
                if (vesselsRef.current[mmsi]) {
                    acc[mmsi] = {
                        ...vesselsRef.current[mmsi],
                        encounteringVessels: [
                            ...(vesselsRef.current[mmsi].encounteringVessels || []).filter(
                                (ev) => ev.isFutureCri !== isFutureCri && (isFutureCri || ev.mmsi in parsedData),
                            ),
                            ...(parsedData[mmsi] ? parsedData[mmsi] : []),
                        ],
                    };
                }
                return acc;
            }, {});

            updateVessels(updatedVessels);
        };

        eventSource.addEventListener("cri", (event) => handleEncounterEvent(event, false));
        eventSource.addEventListener("future_cri", (event) => handleEncounterEvent(event, true));

        return () => {
            console.log(`Closing connection to ${url}`);
            eventSource.close();
        };
    }, [baseUrl, mapOptions, predictionEndpoint, setVessels]);

    return (
        <VesselsContext.Provider
            value={{
                vessels,
                filtered,
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

function vesselReviver(_key: string, value: any): Vessel[] {
    if (Array.isArray(value)) {
        return value.map((item) => {
            if (typeof item === "object" && item !== null) {
                return {
                    mmsi: item["mmsi"],
                    vesselType: item["type of mobile"],
                    latitude: item["latitude"],
                    longitude: item["longitude"],
                    length: item["length"] || 0,
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
function predictionReviver(_key: string, value: any): VesselForecast[] {
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
                } as ForecastPoint);
            }
        });

        return Object.entries(groupedByMmsi).map(([mmsi, forecast]) => ({
            mmsi,
            forecast,
        })) as VesselForecast[];
    }
    return value;
}

function enounterReviver(_key: string, value: any): VesselEncounter[] {
    if (Array.isArray(value)) {
        return value.map((item) => {
            if (typeof item === "object" && item !== null) {
                return {
                    vessel1: {
                        mmsi: item["vessel_1"],
                        latitude: item["vessel_1_latitude"],
                        longitude: item["vessel_1_longitude"],
                        sog: item["vessel_1_speed"],
                        cog: item["vessel_1_course"],
                        length: item["vessel_1_length"],
                    },
                    vessel2: {
                        mmsi: item["vessel_2"],
                        latitude: item["vessel_2_latitude"],
                        longitude: item["vessel_2_longitude"],
                        sog: item["vessel_2_speed"],
                        cog: item["vessel_2_course"],
                        length: item["vessel_2_length"],
                    },
                    distance: item["distance"],
                    startTime: item["start_time"],
                    endTime: item["end_time"],
                    duration: item["duration"],
                    euclidianDist: item["euclidian_dist"],
                    relMovementDirection: item["rel_movement_direction"],
                    azimuthTargetToOwn: item["azimuth_target_to_own"],
                    cri: item["ves_cri"],
                } as VesselEncounter;
            }
            return item;
        });
    }
    return value;
}

export { useVessels, VesselsProvider };
