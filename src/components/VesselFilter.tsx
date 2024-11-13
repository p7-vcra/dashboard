import { useState } from 'react';
import { useVessels } from '../contexts/VesselsContext';

function VesselFilter() {
  const { updateFilter } = useVessels();
  const [sogRange, setSogRange] = useState({ min: 0, max: 30 });

  const applyFilter = () => {
    // log the filter values
    console.log(sogRange);
    console.log((document.getElementById('vesselType') as HTMLInputElement).value);

    updateFilter((vessel) => {
      const vesselType = (document.getElementById('vesselType') as HTMLInputElement).value;
      return vessel.sog >= sogRange.min && vessel.sog <= sogRange.max && vessel.vesselType.includes(vesselType);
    });
  };

  const clearFilter = () => {
    updateFilter(() => true);
    setSogRange({ min: 0, max: 30 });
    (document.getElementById('vesselType') as HTMLInputElement).value = '';
  };

  const filters = {
    sog: {
      label: 'Speed over ground',
      min: 0,
      max: 30,
      type: 'number',
      step: 1,
    },
    vesselType: {
      label: 'Vessel type',
      type: 'text',
    },
  };

  return (
    <div className="">
      <h2 className="text-white text-lg font-bold">Filters</h2>
      <div className="space-y-4">
        {Object.entries(filters).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <label className="text-white" htmlFor={key}>
              {value.label}
            </label>
            {value.type === 'number' ? (
              <div className="space-y-2 flex-col text-white">
                <div className="grid grid-cols-8 items-center space-x-2">
                  <span className="uppercase text-zinc-400 font-bold col-span-1">Min</span>
                  <input
                    type="number"
                    id={`${key}-range`}
                    name={`${key}-range`}
                    min={value.min}
                    max={value.max}
                    step={value.step}
                    value={sogRange.min}
                    onChange={(e) => setSogRange({ ...sogRange, min: Number(e.target.value) })}
                    className="w-full bg-zinc-700 rounded-lg p-2 col-span-7"
                  />
                </div>
                <div className="grid grid-cols-8 items-center space-x-2">
                  <span className="uppercase text-zinc-400 font-bold col-span-1">Max</span>
                  <input
                    type="number"
                    id={`${key}-range`}
                    name={`${key}-range`}
                    min={value.min}
                    max={value.max}
                    step={value.step}
                    value={sogRange.max}
                    onChange={(e) => setSogRange({ ...sogRange, max: Number(e.target.value) })}
                    className="w-full bg-zinc-700 rounded-lg p-2 col-span-7"
                  />
                </div>
              </div>
            ) : (
              <input type={value.type} id={key} name={key} className="w-full bg-zinc-700 text-white p-2 rounded-lg" />
            )}
          </div>
        ))}
        <div className="flex space-x-2">
          <button onClick={applyFilter} className="bg-zinc-600 text-white p-2 rounded-lg">
            Apply filter
          </button>
          <button onClick={clearFilter} className="bg-zinc-600 text-white p-2 rounded-lg">
            Clear filter
          </button>
        </div>
      </div>
    </div>
  );
}

export default VesselFilter;
