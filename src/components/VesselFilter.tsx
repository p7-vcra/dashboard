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
      <h2 className="text-white text-md font-bold">Filters</h2>
      <div className="">
        <div className="flex space-x-8">
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="text-white" htmlFor={key}>
                {value.label}
              </label>
              {value.type === 'number' ? (
                <div className="space-x-2 flex text-white">
                  <div className="flex items-center space-x-2 w-32">
                    <span className="uppercase text-zinc-400 font-bold">Min</span>
                    <input
                      type="number"
                      id={`${key}-range`}
                      name={`${key}-range`}
                      min={'min' in value ? value.min : undefined}
                      max={'max' in value ? value.max : undefined}
                      step={'step' in value ? value.step : undefined}
                      value={sogRange.min}
                      onChange={(e) => setSogRange({ ...sogRange, min: Number(e.target.value) })}
                      className="w-full bg-zinc-700 rounded-lg p-2"
                    />
                  </div>
                  <div className="flex items-center space-x-2 w-32">
                    <span className="uppercase text-zinc-400 font-bold">Max</span>
                    <input
                      type="number"
                      id={`${key}-range`}
                      name={`${key}-range`}
                      min={'min' in value ? value.min : undefined}
                      max={'max' in value ? value.max : undefined}
                      step={'step' in value ? value.step : undefined}
                      value={sogRange.max}
                      onChange={(e) => setSogRange({ ...sogRange, max: Number(e.target.value) })}
                      className="w-full bg-zinc-700 rounded-lg p-2"
                    />
                  </div>
                </div>
              ) : (
                <input type={value.type} id={key} name={key} className="w-full bg-zinc-700 text-white p-2 rounded-lg" />
              )}
            </div>
          ))}
          <div className="flex items-center space-x-2 w-96">
            <button
              onClick={applyFilter}
              className="bg-zinc-600 text-white p-2 rounded-lg hover:bg-zinc-500 active:bg-zinc-700 w-full h-min">
              Apply filter
            </button>
            <button
              onClick={clearFilter}
              className="bg-zinc-600 text-white p-2 rounded-lg hover:bg-zinc-500 active:bg-zinc-700 w-full h-min">
              Clear filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VesselFilter;
