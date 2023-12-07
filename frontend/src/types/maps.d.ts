interface LatLng {
  latitude: number
  longitude: number
}

interface Viewport {
  low: LatLng
  high: LatLng
}

interface Waypoint extends LatLng {
  description?: string
  title?: string // @deprecated
  latitude: number | null
  longitude: number | null
}

interface AutocompleteItem {
  title: string
  address: string
  placeId: string
}

/* Google Route API v2
  https://developers.google.com/maps/documentation/routes/reference/rest/v2/TopLevel/computeRoutes
*/
interface Location {
  latlng: LatLng
  heading: number
}

interface RouteLegStep {
  distanceMeters: number
  staticDuration: string
  polyline: {
    encodedPolyline: string
  }
  startLocation: Location
  endLocation: Location
}

interface RouteLeg {
  distanceMeters: number
  duration: string
  staticDuration: string
  polyline: {
    encodedPolyline: string
  }
  startLocation: Location
  endLocation: Location
  steps: RouteLegStep[]
}
