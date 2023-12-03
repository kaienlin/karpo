import { decode } from '@mapbox/polyline'

export const flattenLegs = (legs: Leg[]): { route: LatLng[]; durations: string[] } => {
  const route = legs.reduce((total, leg) => {
    return total.concat(
      decode(leg.polyline.encodedPolyline).map(([lat, lng]: number[]) => ({
        latitude: lat,
        longitude: lng
      }))
    )
  }, [])

  const durations = legs.reduce((total, leg) => {
    return total.concat(leg.steps.map(({ staticDuration }) => staticDuration))
  }, [])

  return { route, durations }
}

export const isValidWaypoint = (waypoint: Waypoint): boolean => {
  return waypoint.latitude != null && waypoint.longitude != null
}

export const isValidWaypoints = (waypoints: Waypoint[]): boolean => {
  return waypoints.every(isValidWaypoint)
}
