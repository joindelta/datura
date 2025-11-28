import { CITIES } from "@/types";

interface CityCoordinates {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

const CITY_COORDINATES: CityCoordinates[] = [
  { id: "sf", name: "San Francisco", lat: 37.7749, lng: -122.4194 },
  { id: "nyc", name: "New York", lat: 40.7128, lng: -74.006 },
  { id: "la", name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { id: "chicago", name: "Chicago", lat: 41.8781, lng: -87.6298 },
  { id: "seattle", name: "Seattle", lat: 47.6062, lng: -122.3321 },
  { id: "austin", name: "Austin", lat: 30.2672, lng: -97.7431 },
  { id: "boston", name: "Boston", lat: 42.3601, lng: -71.0589 },
  { id: "denver", name: "Denver", lat: 39.7392, lng: -104.9903 },
  { id: "miami", name: "Miami", lat: 25.7617, lng: -80.1918 },
  { id: "portland", name: "Portland", lat: 45.5152, lng: -122.6784 },
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
  let nearestCity = CITY_COORDINATES[0];
  let minDistance = getDistanceFromCoordinates(
    latitude,
    longitude,
    nearestCity.lat,
    nearestCity.lng
  );

  for (let i = 1; i < CITY_COORDINATES.length; i++) {
    const city = CITY_COORDINATES[i];
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

  return nearestCity.id;
}
