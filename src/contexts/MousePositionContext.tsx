import { LatLng } from "leaflet";
import React, { createContext, useCallback, useContext, useState } from "react";

interface MousePositionContextType {
    mousePosition: LatLng;
    setMousePosition: (mousePosition: LatLng) => void;
}

const MousePositionContext = createContext<
    MousePositionContextType | undefined
>(undefined);

function MousePositionProvider({ children }: { children: React.ReactNode }) {
    const denmarkCoords = new LatLng(56.2639, 9.5018);

    const [mousePosition, setMousePosition] = useState<LatLng>(
        new LatLng(denmarkCoords.lat, denmarkCoords.lng),
    );

    const updateMousePosition = useCallback((MousePosition: LatLng) => {
        return setMousePosition(MousePosition);
    }, []);

    return (
        <MousePositionContext.Provider
            value={{ mousePosition, setMousePosition: updateMousePosition }}
        >
            {children}
        </MousePositionContext.Provider>
    );
}

function useMousePosition() {
    const context = useContext(MousePositionContext);
    if (!context) {
        throw new Error(
            "useMousePosition must be used within an MousePositionProvider",
        );
    }
    return context;
}

export { MousePositionProvider, useMousePosition };
