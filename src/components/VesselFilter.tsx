import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { useVessels } from "../contexts/VesselsContext";

interface VesselFilterProps {
    onClose: () => void;
}

function VesselFilter({ onClose }: VesselFilterProps) {
    const { updateFilter } = useVessels();
    const [sogRange, setSogRange] = useState({ min: 0, max: 30 });
    const [vesselType, setVesselType] = useState("");
    const [hasFutureLocation, setHasFutureLocation] = useState(false);

    const applyFilter = () => {
        updateFilter((vessel) => {
            return (
                vessel.sog >= sogRange.min &&
                vessel.sog <= sogRange.max &&
                vessel.vesselType.includes(vesselType) &&
                (!hasFutureLocation ||
                    (vessel.futureLocation && vessel.futureLocation.length > 0))
            );
        });
    };

    const clearFilter = () => {
        updateFilter(() => true);
        setSogRange({ min: 0, max: 30 });
        setVesselType("");
        setHasFutureLocation(false);

        document.querySelectorAll("input").forEach((input) => {
            input.value = "";
            input.checked = false;
        });
        document
            .querySelectorAll("select")
            .forEach((select) => (select.value = ""));
    };

    const filters = {
        sog: {
            display: "Speed over ground",
            min: 0,
            max: 30,
            type: "number",
            step: 1,
        },
        vesselType: {
            display: "Vessel type",
            options: ["Class A", "Class B", "Base Station", "AtoN"],
            type: "select",
        },
        hasFutureLocation: {
            display: "Trajectory prediction",
            label: "Only forecasted location",
            type: "checkbox",
        },
    };

    return (
        <div className="  bg-zinc-800 bg-opacity-85 backdrop-blur-lg p-4  rounded-xl border-2 border-zinc-600">
            <div className="w-full flex items-center justify-between text-white">
                <div className="font-bold">Filters</div>
                <button
                    className="text-sm p-2 text-white hover:bg-zinc-600 rounded-md w-8 h-8"
                    onClick={onClose}
                >
                    <FontAwesomeIcon icon={faClose} />
                </button>
            </div>
            <div className="text-white">
                <div className="flex space-x-8 pt-2">
                    {Object.entries(filters).map(([key, value]) => (
                        <div key={key} className="space-y-2 flex flex-col">
                            <div className="text-white">{value.display}</div>
                            {value.type === "number" ? (
                                <div className="space-x-2 flex text-white h-full">
                                    <input
                                        type="number"
                                        id={`${key}-range`}
                                        name={`${key}-range`}
                                        min={
                                            "min" in value
                                                ? value.min
                                                : undefined
                                        }
                                        max={
                                            "max" in value
                                                ? value.max
                                                : undefined
                                        }
                                        step={
                                            "step" in value
                                                ? value.step
                                                : undefined
                                        }
                                        placeholder="Min"
                                        onChange={(e) =>
                                            setSogRange({
                                                ...sogRange,
                                                min: Number(e.target.value),
                                            })
                                        }
                                        className=" bg-zinc-700 border-zinc-600 border-2 rounded-lg p-2  w-full"
                                    />
                                    <input
                                        type="number"
                                        id={`${key}-range`}
                                        name={`${key}-range`}
                                        min={
                                            "min" in value
                                                ? value.min
                                                : undefined
                                        }
                                        max={
                                            "max" in value
                                                ? value.max
                                                : undefined
                                        }
                                        step={
                                            "step" in value
                                                ? value.step
                                                : undefined
                                        }
                                        placeholder="Max"
                                        onChange={(e) =>
                                            setSogRange({
                                                ...sogRange,
                                                max: Number(e.target.value),
                                            })
                                        }
                                        className=" bg-zinc-700 border-zinc-600 border-2 rounded-lg p-2  w-full"
                                    />
                                </div>
                            ) : (
                                "options" in value && (
                                    <select
                                        id={key}
                                        name={key}
                                        className="bg-zinc-700 border-zinc-600 border-2 rounded-lg p-2 h-full"
                                        defaultValue=""
                                        onChange={(e) =>
                                            setVesselType(e.target.value)
                                        }
                                    >
                                        <option value="" disabled>
                                            Select vessel type
                                        </option>
                                        {value.options.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                )
                            )}
                            {value.type === "checkbox" && (
                                <div className="peer-container">
                                    <input
                                        type="checkbox"
                                        id={key}
                                        name={key}
                                        onChange={(e) =>
                                            setHasFutureLocation(
                                                e.target.checked
                                            )
                                        }
                                        className="peer hidden"
                                    />
                                    <div className=" bg-zinc-700 border-2 border-zinc-600 rounded-lg flex peer-checked:bg-zinc-500 peer-checked:border-zinc-300">
                                        <label
                                            htmlFor={key}
                                            className="text-white p-4 "
                                        >
                                            {"label" in value && value.label}
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="flex items-center justify-between flex-col space-y-2 w-44 text-sm">
                        <button
                            onClick={applyFilter}
                            className="bg-zinc-700 text-white p-2 rounded-lg hover:bg-zinc-600 active:bg-zinc-700 w-full border-2 border-zinc-600"
                        >
                            Apply filter
                        </button>
                        <button
                            onClick={clearFilter}
                            className="bg-zinc-700 text-white p-2 rounded-lg hover:bg-zinc-600 active:bg-zinc-700 w-full border-2 border-zinc-600"
                        >
                            Clear filter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VesselFilter;
