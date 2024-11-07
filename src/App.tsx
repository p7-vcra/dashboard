import { BrowserRouter, Route, Routes } from "react-router-dom";
import { VesselsProvider } from './contexts/VesselsContext'; // Import the VesselsProvider
import './leaflet.css';
import Layout from "./pages/Layout";
import Map from "./pages/Map";
import Vessels from "./pages/Vessels";

function App() {
  return (
    <BrowserRouter>
      <VesselsProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Map />} />
            <Route path="/vessels" element={<Vessels />} />
          </Route>
        </Routes>
      </VesselsProvider>
    </BrowserRouter>
  );
}

export default App;
