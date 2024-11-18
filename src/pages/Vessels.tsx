import React from 'react';
import VesselCard from '../components/VesselCard';
import { useVesselData } from '../contexts/VesselsContext';
//import { Vessel } from '../types/vessel';

const Vessels: React.FC = () => {
  const { filtered } = useVesselData(); // Access vessels from VesselsContext
  return (
    <div>
      {Object.values(filtered).map((vessel) => (
        <VesselCard key={vessel.mmsi} vessel={vessel} />
      ))}
    </div>
  );
};

export default Vessels;
