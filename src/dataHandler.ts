import { ref } from 'vue';

// Define a TypeScript interface for the vessel type
export interface Vessel {
  MMSI: number;
  VesselType: String;
  latitude: number;
  longitude: number;
  history: Array<{ latitude: number, longitude: number, timestamp: string, cog: number, sog: number }>;
  cog: number;
  sog: number
}

// Create a reactive object to store vessel data
const vessels = ref<{ [MMSI: number]: Vessel }>({});

// Function to initialize the EventSource connection
export function initializeDataFeed() {
  console.log('Initializing EventSource...');
  const eventSource = new EventSource('http://130.225.37.58:8000/dummy-ais-data');

  eventSource.onopen = () => console.log('EventSource connection opened');

  eventSource.addEventListener("ais", (event) => handleEventMessage(event));

  eventSource.onerror = (error) => handleEventError(error, eventSource);
}

// Handle incoming event messages
function handleEventMessage(event: MessageEvent) {
  console.log('Raw event data received');

  try {
    const newData = JSON.parse(event.data);
   // console.log('Parsed JSON data:' , newData);
    processVesselData(newData);
  } catch (error) {
    console.error('Error parsing data:', error);
  }
}

// Handle EventSource errors
function handleEventError(error: Event, eventSource: EventSource) {
  console.error('EventSource failed:', error);
  eventSource.close();
}

// Process new vessel data
function processVesselData(newData: Array<any>) {
  newData.forEach((data) => {
    const { MMSI, "Type of mobile": VesselType, Latitude, Longitude, Timestamp, COG, SOG } = data;
    //console.log(`Vessel with mmsi: ${MMSI} has heading: ${Heading}`);
    
    // Validate MMSI, Latitude, Longitude COG, and SOG values
    if (!MMSI || isNaN(MMSI) || isNaN(Latitude) || isNaN(Longitude) || isNaN(COG) || isNaN(SOG)) {
      console.warn('Invalid vessel data:', data);  // Log invalid data for debugging
      return;  // Skip invalid data
    }

    const vessel = vessels.value[MMSI];

    if (vessel) {
      updateVessel(vessel, Latitude, Longitude, COG, SOG);
    } else if (Object.keys(vessels.value).length < 50) {
      addNewVessel(MMSI, VesselType, Latitude, Longitude, Timestamp, COG, SOG);
    }
  });
  //console.log('Number of vessels:', Object.keys(vessels.value).length);
}

// Update existing vessel data
function updateVessel(vessel: Vessel, latitude: number, longitude: number, cog: number, sog: number) {
  vessel.history.push({
    latitude: vessel.latitude,
    longitude: vessel.longitude,
    timestamp: vessel.history[vessel.history.length - 1]?.timestamp || '',
    cog: vessel.cog,
    sog: vessel.sog
  });
  vessel.latitude = latitude;
  vessel.longitude = longitude;
  vessel.cog = cog;
  vessel.sog = sog;
}

function addNewVessel(MMSI: number, VesselType: String, latitude: number, longitude: number, timestamp: string, cog: number, sog: number) {
  // Ensure MMSI is a valid number before adding the vessel
  if (isNaN(MMSI) || VesselType !== "Class A" || cog === null || sog === null) {
    //console.warn('Invalid MMSI value:', MMSI);
    return;  // Skip adding the vessel if MMSI is invalid
  }

  vessels.value[MMSI] = {
    MMSI,
    VesselType,
    latitude,
    longitude,
    cog,
    sog,
    history: [{ latitude, longitude, timestamp, cog, sog }],
  };

  //console.log('New vessel added:', vessels.value[MMSI]);
  //console.log('Vessel type:', VesselType);  // Log the vessel type
}



// Export the vessels object so it can be used in components
export { vessels };