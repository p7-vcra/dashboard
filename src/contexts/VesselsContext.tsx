import React, { createContext, useCallback, useContext, useState } from 'react';
import { Vessel } from "../components/Vessel";

interface VesselsContextType {
    vessels: { [mmsi: number]: Vessel };
    updateVessels: (newVessels: { [mmsi: number]: Vessel }) => void;
}

const VesselsContext = createContext<VesselsContextType | undefined>(undefined);

export const VesselsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [vessels, setVessels] = useState<{ [mmsi: number]: Vessel }>({});

    const updateVessels = useCallback((newVessels: { [mmsi: number]: Vessel }) => {
        setVessels(prevVessels => ({
            ...prevVessels,
            ...newVessels
        }));
    }, []);

    return (
        <VesselsContext.Provider value={{ vessels, updateVessels }}>
            {children}
        </VesselsContext.Provider>
    );
};

export const useVessels = () => {
    const context = useContext(VesselsContext);
    if (!context) {
        throw new Error("useVessels must be used within a VesselsProvider");
    }
    return context;
};
