import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { LatLng } from "leaflet";
import React, { useState } from "react";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useMap } from "../contexts/MapContext";
import { Vessel } from "../types/vessel";

interface VesselSearchProps {
    vessels: { [mmsi: string]: Vessel };
}

function VesselSearch({ vessels }: VesselSearchProps) {
    const { setActiveVesselMmsi } = useActiveVessel();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setSelectedIndex(-1);
    };

    const { map } = useMap();
    const handleVesselClick = (vessel: Vessel) => {
        if (vessel) {
            setActiveVesselMmsi(vessel.mmsi);
        }
        map?.setView(new LatLng(vessel.latitude, vessel.longitude));
        setSearchTerm("");
        setSelectedIndex(-1);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (filteredVessels.length > 0) {
            if (e.key === "ArrowDown") {
                setSelectedIndex((prevIndex) => {
                    const newIndex = (prevIndex + 1) % filteredVessels.length;
                    scrollIntoView(newIndex + 1);
                    return newIndex;
                });
            } else if (e.key === "ArrowUp") {
                setSelectedIndex((prevIndex) => {
                    const newIndex = (prevIndex - 1 + filteredVessels.length) % filteredVessels.length;
                    scrollIntoView(newIndex - 1);
                    return newIndex;
                });
            } else if (e.key === "Enter" && selectedIndex >= 0) {
                handleVesselClick(filteredVessels[selectedIndex]);
            } else if (e.key === "Escape") {
                setSearchTerm("");
                setSelectedIndex(-1);
            }
        }
    };

    const scrollIntoView = (index: number) => {
        const element = document.querySelectorAll("#results > li")[index] as HTMLElement;
        element?.scrollIntoView({ behavior: "instant", block: "nearest" });
    };

    const filteredVessels = Object.values(vessels).filter(
        (vessel) =>
            vessel.mmsi.toString().includes(searchTerm) ||
            vessel.name?.toLocaleLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <div className="text-base text-white w-full">
            <div className="relative w-full">
                <div className="flex items-center">
                    <FontAwesomeIcon icon={faSearch} className="mr-2" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a vessel"
                        className="bg-transparent py-2 pr-4 !outline-none w-full"
                    />
                </div>
                {searchTerm.length > 2 && filteredVessels.length > 0 && (
                    <div className="z-10 -mx-3 mt-3 rounded-b-lg bg-zinc-700 shadow-lg shadow-black/20 bg-opacity-50 backdrop-blur-md absolute border-b-2 border-t-2 border-zinc-600 w-[calc(100%+1.5rem)] max-h-[36rem] overflow-y-auto">
                        <ul className="pt-2 pb-1 px-1" id="results">
                            {filteredVessels.map((vessel, index) => (
                                <li
                                    key={vessel.mmsi}
                                    onClick={() => handleVesselClick(vessel)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    onMouseMove={() => setSelectedIndex(index)}
                                    className={`cursor-pointer p-2 rounded-md ${
                                        index === selectedIndex ? "bg-zinc-800" : ""
                                    }`}
                                >
                                    <div className="space-y-2 text-left">
                                        <div className="font-bold text-zinc-300 text-sm">
                                            {vessel.name !== "" ? vessel.name : "-"}
                                        </div>
                                        <div className="">{vessel.mmsi}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}

export default VesselSearch;
