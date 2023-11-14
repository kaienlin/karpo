interface LatLng {
  latitude: number
  longitude: number
}

interface Viewport {
  low: LatLng
  high: LatLng
}

interface Waypoint extends LatLng {
  title: string
  latitude: number | null
  longitude: number | null
}

interface AutocompleteItem {
  title: string
  address: string
  placeId: string
}
