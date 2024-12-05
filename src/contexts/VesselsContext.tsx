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

// event: prediction;
// data: [
//     {
//         timestamp: "2024-09-09T12:07:00.000",
//         mmsi: 210731000,
//         latitude: 57.8456963329,
//         longitude: 10.0507468831,
//     },
//     {
//         timestamp: "2024-09-09T12:08:00.000",
//         mmsi: 210731000,
//         latitude: 57.8455609128,
//         longitude: 10.0502859755,
//     },
//     {
//         timestamp: "2024-09-09T12:09:00.000",
//         mmsi: 210731000,
//         latitude: 57.8453763454,
//         longitude: 10.0503364072,
//     },
//     {
//         timestamp: "2024-09-09T12:10:00.000",
//         mmsi: 210731000,
//         latitude: 57.8452220914,
//         longitude: 10.0499802476,
//     },
//     {
//         timestamp: "2024-09-09T12:11:00.000",
//         mmsi: 210731000,
//         latitude: 57.8450312778,
//         longitude: 10.049699889,
//     },
//     {
//         timestamp: "2024-09-09T12:12:00.000",
//         mmsi: 210731000,
//         latitude: 57.8449827542,
//         longitude: 10.0495931879,
//     },
//     {
//         timestamp: "2024-09-09T12:13:00.000",
//         mmsi: 210731000,
//         latitude: 57.8449004661,
//         longitude: 10.0492243875,
//     },
//     {
//         timestamp: "2024-09-09T12:14:00.000",
//         mmsi: 210731000,
//         latitude: 57.8447467573,
//         longitude: 10.0493452117,
//     },
//     {
//         timestamp: "2024-09-09T12:15:00.000",
//         mmsi: 210731000,
//         latitude: 57.8446334447,
//         longitude: 10.0489260268,
//     },
//     {
//         timestamp: "2024-09-09T12:16:00.000",
//         mmsi: 210731000,
//         latitude: 57.8445258495,
//         longitude: 10.0489018415,
//     },
//     {
//         timestamp: "2024-09-09T12:17:00.000",
//         mmsi: 210731000,
//         latitude: 57.8444344742,
//         longitude: 10.0485454179,
//     },
//     {
//         timestamp: "2024-09-09T12:18:00.000",
//         mmsi: 210731000,
//         latitude: 57.8443451883,
//         longitude: 10.0484796508,
//     },
//     {
//         timestamp: "2024-09-09T12:19:00.000",
//         mmsi: 210731000,
//         latitude: 57.8441855866,
//         longitude: 10.0482265355,
//     },
//     {
//         timestamp: "2024-09-09T12:20:00.000",
//         mmsi: 210731000,
//         latitude: 57.8442540118,
//         longitude: 10.0480990198,
//     },
//     {
//         timestamp: "2024-09-09T12:21:00.000",
//         mmsi: 210731000,
//         latitude: 57.8440356084,
//         longitude: 10.0478957898,
//     },
//     {
//         timestamp: "2024-09-09T12:22:00.000",
//         mmsi: 210731000,
//         latitude: 57.8439292384,
//         longitude: 10.0477231897,
//     },
//     {
//         timestamp: "2024-09-09T12:23:00.000",
//         mmsi: 210731000,
//         latitude: 57.8439523334,
//         longitude: 10.0476459482,
//     },
//     {
//         timestamp: "2024-09-09T12:24:00.000",
//         mmsi: 210731000,
//         latitude: 57.8439633039,
//         longitude: 10.0474051606,
//     },
//     {
//         timestamp: "2024-09-09T12:25:00.000",
//         mmsi: 210731000,
//         latitude: 57.8438895559,
//         longitude: 10.0470892667,
//     },
//     {
//         timestamp: "2024-09-09T12:26:00.000",
//         mmsi: 210731000,
//         latitude: 57.8437733443,
//         longitude: 10.0470206172,
//     },
//     {
//         timestamp: "2024-09-09T12:27:00.000",
//         mmsi: 210731000,
//         latitude: 57.8435771306,
//         longitude: 10.0468496259,
//     },
//     {
//         timestamp: "2024-09-09T12:28:00.000",
//         mmsi: 210731000,
//         latitude: 57.8435774519,
//         longitude: 10.0468106797,
//     },
//     {
//         timestamp: "2024-09-09T12:29:00.000",
//         mmsi: 210731000,
//         latitude: 57.8436284697,
//         longitude: 10.0466152757,
//     },
//     {
//         timestamp: "2024-09-09T12:30:00.000",
//         mmsi: 210731000,
//         latitude: 57.843615068,
//         longitude: 10.0466064642,
//     },
//     {
//         timestamp: "2024-09-09T12:31:00.000",
//         mmsi: 210731000,
//         latitude: 57.8434677706,
//         longitude: 10.0464948012,
//     },
//     {
//         timestamp: "2024-09-09T12:32:00.000",
//         mmsi: 210731000,
//         latitude: 57.843343285,
//         longitude: 10.0457952592,
//     },
//     {
//         timestamp: "2024-09-09T12:33:00.000",
//         mmsi: 210731000,
//         latitude: 57.8432532777,
//         longitude: 10.0458168661,
//     },
//     {
//         timestamp: "2024-09-09T12:34:00.000",
//         mmsi: 210731000,
//         latitude: 57.8434346541,
//         longitude: 10.0456083942,
//     },
//     {
//         timestamp: "2024-09-09T12:35:00.000",
//         mmsi: 210731000,
//         latitude: 57.8433311062,
//         longitude: 10.0456380321,
//     },
//     {
//         timestamp: "2024-09-09T12:36:00.000",
//         mmsi: 210731000,
//         latitude: 57.8431203441,
//         longitude: 10.0455971811,
//     },
//     {
//         timestamp: "2024-09-09T12:37:00.000",
//         mmsi: 210731000,
//         latitude: 57.843318537,
//         longitude: 10.0455281718,
//     },
//     {
//         timestamp: "2024-09-09T12:38:00.000",
//         mmsi: 210731000,
//         latitude: 57.8430866149,
//         longitude: 10.0453298355,
//     },
// ];
