import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Vessel } from "../components/Vessel";
import { useVessels } from './VesselsContext';

interface ActiveVesselContextType {
    activeVessel: Vessel | null;
    setActiveVessel: (vessel: Vessel | null) => void;
}

const ActiveVesselContext = createContext<ActiveVesselContextType | undefined>(undefined);

export const ActiveVesselProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { vessels } = useVessels(); // Access the vessels from VesselsContext
    const [activeVesselMMSI, setActiveVesselMMSI] = useState<number | null>(null);

    // Memoize activeVessel lookup based on the activeVesselMMSI and vessels
    const activeVessel = useMemo(() => {
        return activeVesselMMSI ? vessels[activeVesselMMSI] || null : null;
    }, [vessels, activeVesselMMSI]);

    const updateActiveVessel = useCallback((vessel: Vessel | null) => {
        setActiveVesselMMSI(vessel ? vessel.mmsi : null);
    }, []);

    return (
        <ActiveVesselContext.Provider value={{ activeVessel, setActiveVessel: updateActiveVessel }}>
            {children}
        </ActiveVesselContext.Provider>
    );
};

export const useActiveVessel = () => {
    const context = useContext(ActiveVesselContext);
    if (!context) {
        throw new Error("useActiveVessel must be used within an ActiveVesselProvider");
    }
    return context;
};
