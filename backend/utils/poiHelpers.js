/**
 * Add lat/lng fields to POI(s) that use GeoJSON coordinate structure.
 * 
 * Converts GeoJSON coordinates stored as [longitude, latitude] in MongoDB
 * into flat lat/lng fields for easier use in frontend applications.
 * 
 * This function was generated with the help of ChatGPT.
 */

// Add lat/lng to a single POI
function addLatLngToPOI(poi) {
    const coords = poi?.coordinates?.coordinates;
    return {
        ...poi,
        lat: coords?.[1] ?? null,
        lng: coords?.[0] ?? null,
    };
}

// Add lat/lng to a list of POIs
function addLatLngToPOIs(poiList = []) {
    return poiList.map(addLatLngToPOI);
}

module.exports = {
    addLatLngToPOI,
    addLatLngToPOIs
};
