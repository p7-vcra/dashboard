import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { ActiveVesselProvider } from './contexts/ActiveVesselContext';
import { MapOptionsProvider } from './contexts/MapOptionsContext';
import { VesselsProvider } from './contexts/VesselsContext';
import './leaflet.css';
import Layout from './pages/Layout';
import Map from './pages/Map';
import Vessels from './pages/Vessels';

function App() {
  return (
    <BrowserRouter>
      <VesselsProvider>
        <ActiveVesselProvider>
          <MapOptionsProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Map />} />
                <Route path="/vessels" element={<Vessels />} />
              </Route>
            </Routes>
          </MapOptionsProvider>
        </ActiveVesselProvider>
      </VesselsProvider>
    </BrowserRouter>
  );
}

export default App;
