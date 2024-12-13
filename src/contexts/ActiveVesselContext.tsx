import React, { createContext, useCallback, useContext, useState } from "react";

interface ActiveVesselContextType {
    activeVesselMmsi: string | null;
    // encounteringVesselsMmsi: string[];
    setActiveVesselMmsi: (mmsi: string | null) => void;
    // setEncounteringVesselsMmsi: (mmsis: string[]) => void;
}

const ActiveVesselContext = createContext<ActiveVesselContextType | undefined>(
    undefined
);

function ActiveVesselProvider({ children }: { children: React.ReactNode }) {
    const [activeVesselMmsi, setActiveVesselMmsi] = useState<string | null>(
        null
    );

    const updateActiveVessel = useCallback((mmsi: string | null) => {
        setActiveVesselMmsi(mmsi);
    }, []);

    return (
        <ActiveVesselContext.Provider
            value={{
                activeVesselMmsi,
                setActiveVesselMmsi: updateActiveVessel,
            }}
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
