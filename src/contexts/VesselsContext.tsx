import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Vessel } from "../types/vessel";

interface VesselsContextType {
  vessels: { [mmsi: number]: Vessel };
  filtered: { [mmsi: number]: Vessel };
  updateVessels: (newVessels: { [mmsi: number]: Vessel }) => void;
  filter: (vessel: Vessel) => boolean;
  updateFilter: (predicate: (vessel: Vessel) => boolean) => void;
}

const VesselsContext = createContext<VesselsContextType | undefined>(undefined);

function VesselsProvider({ children }: { children: React.ReactNode }) {
  const [vessels, setVessels] = useState<{ [mmsi: number]: Vessel }>({});
  const [filter, setFilter] = useState<(vessel: Vessel) => boolean>(
    () => () => true,
  );
  const [filtered, setFiltered] = useState<{ [mmsi: number]: Vessel }>({});

  const updateVessels = useCallback(
    (newVessels: { [mmsi: number]: Vessel }) => {
      setVessels((prevVessels) => {
        const updatedVessels = { ...prevVessels, ...newVessels };
        setFiltered(
          Object.fromEntries(
            Object.entries(updatedVessels).filter(([_, vessel]) =>
              filter(vessel),
            ),
          ),
        );
        return updatedVessels;
      });
    },
    [filter],
  );

  const updateFilter = useCallback((predicate: (vessel: Vessel) => boolean) => {
    setFilter(() => predicate);
  }, []);

  useEffect(() => {
    setFiltered(
      Object.fromEntries(
        Object.entries(vessels).filter(([_, vessel]) => filter(vessel)),
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

function useVesselData(bounds?: {
  north: number;
  south: number;
  east: number;
  west: number;
}) {
  const { vessels, updateVessels, filtered } = useVessels();
  const vesselsRef = useRef(vessels);
  vesselsRef.current = vessels;

  const baseUrl = "http://130.225.37.58:8000";

  // Effect for vessel position updates
  useEffect(() => {
    let eventSource: EventSource | null = null;

    const updateEventSource = () => {
      if (eventSource) {
        eventSource.close();
      }

      const url = bounds
        ? `${baseUrl}/slice?latitude_range=${bounds.south},${bounds.north}&longitude_range=${bounds.west},${bounds.east}`
        : `${baseUrl}/dummy-ais-data`;

      eventSource = new EventSource(url);
      eventSource.onopen = () => console.log('EventSource connection opened');

      eventSource.addEventListener('ais', (event) => {
        const eventData: Vessel[] = JSON.parse(event.data, vesselRetriever);
        const parsedData = eventData.reduce((acc: { [mmsi: number]: Vessel }, vessel: Vessel) => {
          const { mmsi, vesselType } = vessel;

          if (vesselType === 'Class A' && !isNaN(mmsi)) {
            acc[mmsi] = {
              ...vesselsRef.current[mmsi],
              ...vessel,
            };
          }
          return acc;
        }, {});

        updateVessels(parsedData);
      });
    };

    updateEventSource();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [bounds, updateVessels]);

  // Effect for future predictions
  useEffect(() => {
    const futureVesselEventSource = new EventSource(`${baseUrl}/dummy-prediction`);
    
    futureVesselEventSource.onopen = () => console.log('Future Vessel course connection opened');
    
    futureVesselEventSource.onerror = (error) => {
      console.error('Future vessel EventSource error:', error);
    };

    futureVesselEventSource.addEventListener('ais', (event) => {
      try {
        const eventData = JSON.parse(event.data);

        if (!Array.isArray(eventData)) {
          console.error('Expected array of predictions, got:', typeof eventData);
          return;
        }

        const vesselPredictions = eventData.reduce((acc: { [mmsi: number]: number[][] }, prediction: any) => {
          if (!prediction.MMSI || !prediction.Latitude || !prediction.Longitude) {
            return acc;
          }

          const mmsi = Number(prediction.MMSI);
          if (!acc[mmsi]) {
            acc[mmsi] = [];
          }
          acc[mmsi].push([prediction.Latitude, prediction.Longitude]);
          return acc;
        }, {});

      // Update the vessels with future predictions
      const updatedVessels = Object.entries(vesselPredictions).reduce(
        (acc: { [mmsi: number]: Vessel }, [mmsi, predictions]) => {
          if (vesselsRef.current[Number(mmsi)]) {
            acc[Number(mmsi)] = {
              ...vesselsRef.current[Number(mmsi)],
              //@ts-expect-error
              futureLocation: predictions.slice(1), // Skip first point if necessary
            };
            console.log('Added future points to vessel', mmsi, predictions.slice(1));
          }
          return acc;
        },
        {}
      );

        if (Object.keys(updatedVessels).length > 0) {
          updateVessels(updatedVessels);
        }
      } catch (error) {
        console.error('Error processing future predictions:', error);
      }
    });

    return () => {
      futureVesselEventSource.close();
    };
  }, [updateVessels]);

  return { vessels, filtered };
}

function vesselRetriever(_key: string, value: any): Vessel[] | never {
  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === "object" && item !== null) {
        return {
          mmsi: item["MMSI"],
          vesselType: item["Type of mobile"],
          latitude: item["Latitude"],
          longitude: item["Longitude"],
          history: item["history"] || [],
          cog: item["COG"],
          sog: item["SOG"],
        } as Vessel;
      }
      return item;
    });
  }
  return value;
}

export { useVesselData, useVessels, VesselsProvider };
