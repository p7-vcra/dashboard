import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
// @ts-expect-error No types available
import RangeSlider from "react-range-slider-input";
import { useVessels } from "../contexts/VesselsContext";

interface VesselFilterProps {
    onClose: () => void;
}

function VesselFilter({ onClose }: VesselFilterProps) {
    const { updateFilter } = useVessels();
    const [sogRange, setSogRange] = useState([0, 30]);
    const [criRange, setCriRange] = useState([0, 10]);
    const [vesselType, setVesselType] = useState("");
    const [hasFutureLocation, setHasFutureLocation] = useState(false);

    const applyFilter = () => {
        updateFilter((vessel) => {
            return (
                vessel.sog >= sogRange[0] &&
                vessel.sog <= sogRange[1] &&
                (vessel.cri ?? 0) * 10 >= criRange[0] &&
                (vessel.cri ?? 0) * 10 <= criRange[1] &&
                vessel.vesselType.includes(vesselType) &&
                (!hasFutureLocation ||
                    (vessel.futureLocation && vessel.futureLocation.length > 0))
            );
        });
    };

    const clearFilter = () => {
        updateFilter(() => true);
        setSogRange([0, 30]);
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
            type: "range",
            step: 1,
            value: sogRange,
            onInput: setSogRange,
        },
        cri: {
            display: "Collision risk index",
            min: 0,
            max: 10,
            type: "range",
            step: 1,
            value: criRange,
            onInput: setCriRange,
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
        <div className="bg-zinc-800 bg-opacity-85 backdrop-blur-lg p-4  rounded-xl border-2 border-zinc-600 text-sm">
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
                <div className="flex flex-col space-y-4 pt-2">
                    {Object.entries(filters).map(([key, value]) => (
                        <div key={key} className="space-y-2 flex flex-col">
                            <div className=" font-bold text-zinc-300 text-xs">
                                {value.display.toLocaleUpperCase()}
                            </div>
                            {value.type === "range" ? (
                                <div className="space-x-2 flex-col text-white h-full">
                                    <div className="flex items-center space-x-2">
                                        <div>
                                            {key === "cri" && "value" in value
                                                ? `${value.value[0] / 10}`
                                                : "value" in value
                                                ? `${value.value[0]}`
                                                : ""}
                                        </div>
                                        <RangeSlider
                                            max={"max" in value ? value.max : 0}
                                            min={"min" in value ? value.min : 0}
                                            defaultValue={
                                                "min" in value && "max" in value
                                                    ? [value.min, value.max]
                                                    : [0, 0]
                                            }
                                            className="w-full bg-zinc-500"
                                            onInput={
                                                "onInput" in value
                                                    ? value.onInput
                                                    : undefined
                                            }
                                            value={
                                                "value" in value
                                                    ? value.value
                                                    : undefined
                                            }
                                        />
                                        <div>
                                            {key === "cri" && "value" in value
                                                ? `${value.value[1] / 10}`
                                                : "value" in value
                                                ? `${value.value[1]}`
                                                : ""}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                "options" in value &&
                                value.type == "select" && (
                                    <select
                                        id={key}
                                        name={key}
                                        className="bg-zinc-700 border-zinc-600 border-2 rounded-lg p-2 h-full"
                                        defaultValue=""
                                        onChange={(e) =>
                                            setVesselType(e.target.value)
                                        }
                                    >
                                        <option value="">Any</option>
                                        {value.options.map((option) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                )
                            )}
                            {value.type === "checkbox" && (
                                <div className="peer-container cursor-pointer">
                                    <input
                                        type="checkbox"
                                        id={key}
                                        name={key}
                                        onChange={(e) =>
                                            setHasFutureLocation(
                                                e.target.checked
                                            )
                                        }
                                        className="peer hidden cursor-pointer"
                                    />
                                    <div className=" bg-zinc-700 border-2 cursor-pointer border-zinc-600 rounded-lg flex peer-checked:bg-zinc-500 peer-checked:border-zinc-300">
                                        <label
                                            htmlFor={key}
                                            className="text-white p-2 cursor-pointer select-none"
                                        >
                                            {"label" in value && value.label}
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                    <div className="flex items-center justify-between flex-col space-y-2  text-sm border-t border-zinc-500 border-opacity-50 pt-4">
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
