// import refactored data fetch (vessel) and react
import { Vessel } from './Vessel';
import React from 'react';



interface ShipModalProps {
    vessel ?:  Vessel;
    isOpen: boolean;
    closeModal: () => void;
}



const ShipModal: React.FC<ShipModalProps> = ({ vessel, isOpen, closeModal }) => {
    if (!isOpen) return null;

    return (
        <div className="flex justify-center items-center fixed z-10 left-0 top-0 w-full h-full overflow-auto bg-black bg-opacity-40">
            <div className="bg-white p-5 border border-gray-400 w-4/5 max-w-lg rounded-lg">
                <span className="text-gray-500 float-right text-2xl font-bold cursor-pointer hover:text-black" onClick={closeModal}>&times;</span>
                {vessel && (
                    <>
                        <h3>{vessel.MMSI}</h3>
                        <p>Type: {vessel.VesselType}</p>
                        <p>Latitude: {vessel.latitude}</p>
                        <p>Longitude: {vessel.longitude}</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default ShipModal;



