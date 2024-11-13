import { useVessels } from '../contexts/VesselsContext';

function VesselFilter() {
  const { updateFilter } = useVessels();

  const applyFilter = () => {
    updateFilter((vessel) => vessel.sog > 18);
  };

  return (
    <div className="p-4 pl-64">
      <button className="p-2 bg-red-600" onClick={applyFilter}>
        Filter Class A Vessels
      </button>
    </div>
  );
}

export default VesselFilter;
