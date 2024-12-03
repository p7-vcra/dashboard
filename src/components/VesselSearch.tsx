import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LatLng } from "leaflet";
import React, { useState } from "react";
import { useMap } from "react-leaflet";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { Vessel } from "../types/vessel";
import Container from "./Container";

interface VesselSearchProps {
    vessels: { [mmsi: string]: Vessel };
}

function VesselSearch({ vessels }: VesselSearchProps) {
    const { setActiveVessel } = useActiveVessel();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setSelectedIndex(-1);
    };

    const map = useMap();
    const handleVesselClick = (vessel: Vessel) => {
        if (vessel) {
            setActiveVessel(vessel.mmsi);
        }
        map.setView(new LatLng(vessel.latitude, vessel.longitude), 16);
        setSearchTerm("");
        setSelectedIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (filteredVessels.length > 0) {
            if (e.key === "ArrowDown") {
                setSelectedIndex(
                    (prevIndex) =>
                        (prevIndex + 1) % filteredVessels.slice(0, 10).length
                );
            } else if (e.key === "ArrowUp") {
                setSelectedIndex(
                    (prevIndex) =>
                        (prevIndex - 1 + filteredVessels.slice(0, 10).length) %
                        filteredVessels.slice(0, 10).length
                );
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                handleVesselClick(filteredVessels[selectedIndex]);
            }
        }
    };

    const filteredVessels = Object.values(vessels).filter(
        (vessel) =>
            vessel.mmsi.toString().includes(searchTerm) ||
            vessel.name?.toLocaleLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="m-2 absolute top-0 left-0 z-[1000] text-base text-white min-w-48 ">
            <Container className="p-0">
                <div className="">
                    <FontAwesomeIcon icon={faSearch} className="mr-2 pl-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a vessel"
                        className="bg-transparent py-4 pr-4 !outline-none"
                    />
                </div>
            </Container>
            {searchTerm.length > 2 && filteredVessels.length > 0 && (
                <div className="z-[5001] -mt-2 rounded-b-lg bg-zinc-800 bg-opacity-85 backdrop-blur-xl border-2 border-zinc-600">
                    <ul className="pt-2 pb-1 px-1">
                        {filteredVessels.slice(0, 10).map((vessel, index) => (
                            <li
                                key={vessel.mmsi}
                                onClick={() => handleVesselClick(vessel)}
                                className={`cursor-pointer hover:bg-zinc-800 p-2 rounded-md ${
                                    index === selectedIndex ? "bg-zinc-800" : ""
                                }`}
                            >
                                <div className="space-y-2 text-left">
                                    <div className="font-bold text-zinc-300 text-sm">
                                        {vessel.name !== "" && vessel.name}
                                    </div>
                                    <div className="">{vessel.mmsi}</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default VesselSearch;
