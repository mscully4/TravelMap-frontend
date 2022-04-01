export const GOOGLE_MAPS_API_KEY = 'AIzaSyAk_bN5yfkLuUzptVXIHWs59YdFmI_TjAc'
export const MAPBOX_TOKEN =
  "pk.eyJ1IjoibXNjdWxseTQiLCJhIjoiY2t6ZGNyZTRuMndrcTJub2Y3eGJhMnk4bCJ9.8M6M2JfOcFy0ChpKK6rqUw";

export const DEFAULT_CENTER = { lat: 40.7506, lng: -73.9935 }
export const DEFAULT_ZOOM = 10;
export const DEFAULT_PLACE_ZOOM = 12;

export const DISTANCE_FROM_CITY = 200 /*miles*/

export const metersToMiles = (meters: number) => {
  return meters * 0.000621371;
}

export const milesToMeters = (miles: number) => {
  return miles * 1609.34;
}

export const getDistanceBetweenTwoPoints = (lat1: number, long1: number, lat2: number, long2: number) => {
  const rad = (x: number) => {
    return x * Math.PI / 180;
  };

  var R = 6378137; // Earth’s mean radius in meter
  var dLat = rad(lat2 - lat1);
  var dLong = rad(long2 - long1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return metersToMiles(d) // convert from meters to miles
};

export const AUTOCOMPLETE_RADIUS = milesToMeters(200)
