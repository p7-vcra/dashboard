import { useState } from "react";
// @ts-expect-error No types available
import RangeSlider from "react-range-slider-input";
import { useActiveVessel } from "../contexts/ActiveVesselContext";
import { useVessels } from "../contexts/VesselsContext";
import Button from "./Button";
import ContainerSegment from "./ContainerSegment";

function VesselFilter() {
    const { setFilter } = useVessels();
    const [sogRange, setSogRange] = useState([0, 30]);
    const [criRange, setCriRange] = useState([0, 1]);
    const [vesselType, setVesselType] = useState("");
    const [hasForecast, setHasForecast] = useState(false);
    const [hasEncountering, setHasEncountering] = useState(false);
    const { activeVesselMmsi } = useActiveVessel();
    const { vessels } = useVessels();

    const applyFilter = () => {
        const activeVessel = activeVesselMmsi ? vessels[activeVesselMmsi] : null;

        setFilter((vessel) => {
            return (
                // Filter vessels based on the criteria
                (vessel.sog >= sogRange[0] &&
                    vessel.sog <= sogRange[1] &&
                    (criRange[0] > 0
                        ? vessel.encounteringVessels?.some(
                              (encounter) =>
                                  (criRange[0] <= encounter.cri && criRange[1] >= encounter.cri) ||
                                  (encounter.futureCri &&
                                      criRange[0] <= encounter.futureCri &&
                                      criRange[1] >= encounter.futureCri)
                          )
                        : true) &&
                    vessel.vesselType.includes(vesselType) &&
                    (hasEncountering ? (vessel.encounteringVessels?.length ?? 0) > 0 : true) &&
                    (!hasForecast || (vessel.forecast && vessel.forecast.length > 0))) ||
                // Always show the active vessel and its encountering vessels
                (activeVessel && activeVessel.mmsi === vessel.mmsi) ||
                (activeVessel &&
                    activeVessel.encounteringVessels?.some((encounter) => encounter.mmsi === vessel.mmsi)) ||
                false
            );
        });
    };

    const clearFilter = () => {
        setFilter(() => true);
        setSogRange([0, 30]);
        setCriRange([0, 1]);
        setVesselType("");
        setHasForecast(false);
        setHasEncountering(false);

        document.querySelectorAll("input").forEach((input) => {
            input.value = "";
            input.checked = false;
        });
        document.querySelectorAll("select").forEach((select) => (select.value = ""));
    };

    const filters = {
        sog: {
            display: "Speed over ground",
            type: "range",
            min: 0,
            max: 30,
            step: 1,
            value: sogRange,
            onInput: setSogRange,
        },
        cri: {
            display: "Collision risk index",
            type: "range",
            min: 0,
            max: 1,
            step: 0.1,
            value: criRange,
            onInput: setCriRange,
        },
        vesselType: {
            display: "Vessel type",
            type: "select",
            options: ["Class A", "Class B", "Base Station", "AtoN"],
        },
        hasForecast: {
            display: "Trajectory prediction",
            type: "checkbox",
            label: "Has forecasted location",
            onChange: (checked: boolean) => setHasForecast(checked),
        },
        hasEncountering: {
            display: "Encountering vessels",
            type: "checkbox",
            label: "Has encountering vessels",
            onChange: (checked: boolean) => setHasEncountering(checked),
        },
    };

    return (
        <div className="w-full">
            <div className="text-white">
                <div className="flex flex-col space-y-4 pt-2">
                    {Object.entries(filters).map(([key, value]) => (
                        <div key={key} className="text-sm">
                            <ContainerSegment title={value.display.toLocaleUpperCase()}>
                                {value.type === "range" ? (
                                    <div className="space-x-2 flex-col text-white h-full">
                                        <div className="flex items-center space-x-2">
                                            <div className="min-w-5">{"value" in value ? `${value.value[0]}` : ""}</div>
                                            <RangeSlider
                                                max={"max" in value ? value.max : 0}
                                                min={"min" in value ? value.min : 0}
                                                defaultValue={
                                                    "min" in value && "max" in value ? [value.min, value.max] : [0, 0]
                                                }
                                                className="w-full bg-zinc-500"
                                                onInput={"onInput" in value ? value.onInput : undefined}
                                                value={"value" in value ? value.value : undefined}
                                                step={"step" in value ? value.step : 1}
                                            />
                                            <div className="min-w-5">{"value" in value ? `${value.value[1]}` : ""}</div>
                                        </div>
                                    </div>
                                ) : (
                                    "options" in value &&
                                    value.type == "select" && (
                                        <select
                                            id={key}
                                            name={key}
                                            className="bg-zinc-700 border-zinc-600 border-2 rounded-lg p-2 h-full w-full"
                                            defaultValue=""
                                            onChange={(e) => setVesselType(e.target.value)}
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
                                    <div className="peer-container cursor-pointer w-full">
                                        <input
                                            type="checkbox"
                                            id={key}
                                            name={key}
                                            onChange={(e) =>
                                                "onChange" in value ? value.onChange(e.target.checked) : undefined
                                            }
                                            className="peer hidden cursor-pointer"
                                        />
                                        <div className=" bg-zinc-700 border-2 cursor-pointer border-zinc-600 rounded-lg flex peer-checked:bg-zinc-500 peer-checked:border-zinc-300 w-full">
                                            <label
                                                htmlFor={key}
                                                className="text-white p-2 cursor-pointer select-none w-full"
                                            >
                                                {"label" in value && value.label}
                                            </label>
                                        </div>
                                    </div>
                                )}
                            </ContainerSegment>
                        </div>
                    ))}
                    <div className="flex items-center justify-between space-x-2  text-sm border-t border-zinc-500 border-opacity-50 pt-4">
                        <Button onClick={clearFilter} className="w-full">
                            Clear
                        </Button>
                        <Button
                            onClick={applyFilter}
                            className="bg-blue-700 border-blue-600 hover:bg-blue-600 active:bg-blue-700 w-full"
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default VesselFilter;
