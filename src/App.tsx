import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ActiveVesselProvider } from "./contexts/ActiveVesselContext";
import { VesselsProvider } from "./contexts/VesselsContext";
import "./leaflet.css";
import Layout from "./pages/Layout";
import Map from "./pages/Map";
import Vessels from "./pages/Vessels";

function App() {
  return (
    <BrowserRouter>
      <VesselsProvider>
        <ActiveVesselProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Map />} />
              <Route path="/vessels" element={<Vessels />} />
            </Route>
          </Routes>
        </ActiveVesselProvider>
      </VesselsProvider>
    </BrowserRouter>
  );
}

export default App;
