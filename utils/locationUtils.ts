// Major world cities with coordinates for location matching
const MAJOR_CITIES: Array<{ name: string; lat: number; lng: number }> = [
  { name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", lat: 41.8781, lng: -87.6298 },
  { name: "Seattle", lat: 47.6062, lng: -122.3321 },
  { name: "Austin", lat: 30.2672, lng: -97.7431 },
  { name: "Boston", lat: 42.3601, lng: -71.0589 },
  { name: "Denver", lat: 39.7392, lng: -104.9903 },
  { name: "Miami", lat: 25.7617, lng: -80.1918 },
  { name: "Portland", lat: 45.5152, lng: -122.6784 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832 },
  { name: "Vancouver", lat: 49.2827, lng: -123.1207 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332 },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Hong Kong", lat: 22.3193, lng: 114.1694 },
];

function getDistanceFromCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function findNearestCity(latitude: number, longitude: number): string {
  let nearestCity = MAJOR_CITIES[0];
  let minDistance = getDistanceFromCoordinates(
    latitude,
    longitude,
    nearestCity.lat,
    nearestCity.lng
  );

  for (let i = 1; i < MAJOR_CITIES.length; i++) {
    const city = MAJOR_CITIES[i];
    const distance = getDistanceFromCoordinates(
      latitude,
      longitude,
      city.lat,
      city.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return nearestCity.name;
}

export function getAllCities(): string[] {
  return MAJOR_CITIES.map((city) => city.name);
}
