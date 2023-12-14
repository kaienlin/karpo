import { decode } from '@mapbox/polyline'

export interface RouteDecoded {
  route: LatLng[]
  steps: Array<Array<[number, number]>>
  durations: number[]
}

export const decodeRoute = (legs: RouteLeg[]): RouteDecoded => {
  const steps = legs.reduce<Array<Array<[number, number]>>>((total, leg) => {
    return total.concat(leg.steps.map(({ polyline }) => decode(polyline.encodedPolyline)))
  }, [])

  const route = steps.reduce<LatLng[]>((total, step) => {
    return total.concat(step.map(([latitude, longitude]: number[]) => ({ latitude, longitude })))
  }, [])

  const durations = legs.reduce<number[]>((total, leg) => {
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
