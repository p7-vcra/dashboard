import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ActiveVesselProvider } from "./contexts/ActiveVesselContext";
import { MapProvider } from "./contexts/MapContext";
import { MousePositionProvider } from "./contexts/MousePositionContext";
import { VesselsProvider } from "./contexts/VesselsContext";
import "./leaflet.css";
import Layout from "./pages/Layout";
import Map from "./pages/Map";
import Vessels from "./pages/Vessels";

function App() {
    return (
        <BrowserRouter>
            <MapProvider>
                <VesselsProvider>
                    <ActiveVesselProvider>
                        <MousePositionProvider>
                            <Routes>
                                <Route path="/" element={<Layout />}>
                                    <Route index element={<Map />} />
                                    <Route path="/vessels" element={<Vessels />} />
                                </Route>
                            </Routes>
                        </MousePositionProvider>
                    </ActiveVesselProvider>
                </VesselsProvider>
            </MapProvider>
        </BrowserRouter>
    );
}

export default App;
