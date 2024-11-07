import VesselCard from '../components/VesselCard';
import { Vessel, revivier as vesselsJsonReviver } from '../components/Vessel';

const vessels : Vessel[] = [
   // dummy data
    {
        mmsi: 123456789,
        vesselType: "Class A",
        latitude: 12.123456,
        longitude: -87.123456,
        history: [],
        cog: 123,
        sog: 123
    },
    {
        mmsi: 987654321,
        vesselType: "Class A",
        latitude: 12.123456,
        longitude: -87.123456,
        history: [],
        cog: 123,
        sog: 123
    }
];

const Dashboard: React.FC = () => {
    return (
        <div>
            {vessels.map(vessel => <VesselCard key={vessel.mmsi} vessel={vessel} />)}
        </div>

    );
}

export default Dashboard;

