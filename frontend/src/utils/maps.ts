import { decode } from '@mapbox/polyline'

export const flattenLegs = (
  legs: Leg[]
): { route: LatLng[]; steps: number[][2]; durations: string[] } => {
  const steps = legs.reduce((total, leg) => {
    return total.concat(leg.steps.map(({ polyline }) => decode(polyline.encodedPolyline)))
  }, [])

  const route = steps.reduce((total, step) => {
    return total.concat(step.map(([latitude, longitude]: number[]) => ({ latitude, longitude })))
  }, [])

  const durations = legs.reduce((total, leg) => {
    return total.concat(leg.steps.map(({ staticDuration }) => parseInt(staticDuration)))
  }, [])

  return { route, steps, durations }
}

export const isValidWaypoint = (waypoint: Waypoint): boolean => {
  return waypoint.latitude != null && waypoint.longitude != null
}

export const isValidWaypoints = (waypoints: Waypoint[]): boolean => {
  return waypoints.every(isValidWaypoint)
}
