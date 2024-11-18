import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import { useVessels } from '../contexts/VesselsContext';

interface VesselFilterProps {
  onClose: () => void;
}

function VesselFilter({ onClose }: VesselFilterProps) {
  const { updateFilter } = useVessels();
  const [sogRange, setSogRange] = useState({ min: 0, max: 30 });
  const [vesselType, setVesselType] = useState('');

  const applyFilter = () => {
    updateFilter((vessel) => {
      return vessel.sog >= sogRange.min && vessel.sog <= sogRange.max && vessel.vesselType.includes(vesselType);
    });
  };

  const clearFilter = () => {
    updateFilter(() => true);
    setSogRange({ min: 0, max: 30 });
    setVesselType('');
    document.querySelectorAll('input').forEach((input) => (input.value = ''));
    document.querySelectorAll('select').forEach((select) => (select.value = ''));
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
      options: ['Class A', 'Class B', 'Base Station', 'AtoN'],
      type: 'select',
    },
  };

  return (
    <div className="  bg-zinc-800 bg-opacity-85 backdrop-blur-lg p-4  rounded-xl border-2 border-zinc-600">
      <div className="w-full flex items-center justify-between text-white">
        <div className="font-bold">Filters</div>
        <button className="text-sm p-2 text-white hover:bg-zinc-600 rounded-md w-8 h-8" onClick={onClose}>
          <FontAwesomeIcon icon={faClose} />
        </button>
      </div>
      <div className="text-white">
        <div className="flex space-x-8 pt-2">
          {Object.entries(filters).map(([key, value]) => (
            <div key={key} className="space-y-2 flex flex-col">
              <label className="text-white" htmlFor={key}>
                {value.label}
              </label>
              {value.type === 'number' ? (
                <div className="space-x-2 flex text-white">
                  <input
                    type="number"
                    id={`${key}-range`}
                    name={`${key}-range`}
                    min={'min' in value ? value.min : undefined}
                    max={'max' in value ? value.max : undefined}
                    step={'step' in value ? value.step : undefined}
                    placeholder="Min"
                    onChange={(e) => setSogRange({ ...sogRange, min: Number(e.target.value) })}
                    className=" bg-zinc-700 border-zinc-600 border-2 rounded-lg p-2 w-24"
                  />
                  <input
                    type="number"
                    id={`${key}-range`}
                    name={`${key}-range`}
                    min={'min' in value ? value.min : undefined}
                    max={'max' in value ? value.max : undefined}
                    step={'step' in value ? value.step : undefined}
                    placeholder="Max"
                    onChange={(e) => setSogRange({ ...sogRange, max: Number(e.target.value) })}
                    className=" bg-zinc-700 border-zinc-600 border-2 rounded-lg p-2 w-24"
                  />
                </div>
              ) : (
                'options' in value && (
                  <select
                    id={key}
                    name={key}
                    className="bg-zinc-700 border-zinc-600 border-2 rounded-lg p-2"
                    defaultValue=""
                    onChange={(e) => setVesselType(e.target.value)}>
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
            </div>
          ))}
          <div className="flex items-center flex-col space-y-2 w-44">
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
