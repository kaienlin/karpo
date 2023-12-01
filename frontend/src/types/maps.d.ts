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
