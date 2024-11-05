import { BrowserRouter, Route, Routes } from "react-router-dom";
import './leaflet.css';
import Dashboard from "./pages/Dashboard";
import Layout from "./pages/Layout";
import Map from "./pages/Map";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Map />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App





