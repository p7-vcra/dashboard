import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { Vessel } from "../types/vessel";
import { useVessels } from "./VesselsContext";

interface ActiveVesselContextType {
    activeVessel: Vessel | null;
    setActiveVessel: (vessel: Vessel | null) => void;
}

const ActiveVesselContext = createContext<ActiveVesselContextType | undefined>(
    undefined
);

function ActiveVesselProvider({ children }: { children: React.ReactNode }) {
    const { vessels } = useVessels();
    const [activeVesselMmsi, setActiveVesselMmsi] = useState<string | null>(
        null
    );

    const activeVessel = useMemo(() => {
        return activeVesselMmsi ? vessels[activeVesselMmsi] || null : null;
    }, [vessels, activeVesselMmsi]);

    const updateActiveVessel = useCallback((vessel: Vessel | null) => {
        setActiveVesselMmsi(vessel ? vessel.mmsi : null);
    }, []);

    return (
        <ActiveVesselContext.Provider
            value={{ activeVessel, setActiveVessel: updateActiveVessel }}
        >
            {children}
        </ActiveVesselContext.Provider>
    );
}

function useActiveVessel() {
    const context = useContext(ActiveVesselContext);
    if (!context) {
        throw new Error(
            "useActiveVessel must be used within an ActiveVesselProvider"
        );
    }
    return context;
}

export { ActiveVesselProvider, useActiveVessel };
