import { GOOGLE_MAPS_API_KEY } from '@env'
import Qs from 'qs'

interface AutocompleteItem {
  title: string
  address: string
  placeId: string
}

const initMapsAPI = (apiKey: string) => ({
  getPlaceTitle: async (location: LatLng): Promise<string> => {
    try {
      const { latitude, longitude } = location
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=zh-TW&location_type=ROOFTOP`,
        { method: 'GET' }
      )

      const { results, status } = await response.json()
      if (status !== 'OK') {
        return '未命名的道路'
      }

      const { address_components: addressComponents } = results[0]
      const premise = addressComponents.find((comp: google.maps.GeocoderAddressComponent) =>
        comp.types.includes('premise')
      )
      if (premise !== undefined) {
        return premise.long_name
      }

      const streetNumber = addressComponents.find((comp: google.maps.GeocoderAddressComponent) =>
        comp.types.includes('street_number')
      )
      const route = addressComponents.find((comp: google.maps.GeocoderAddressComponent) =>
        comp.types.includes('route')
      )

      return `${route.long_name}${streetNumber.long_name}${
        streetNumber.long_name.endsWith('號') === true ? '' : '號'
      }`
    } catch (error) {
      console.error(error)
      return ''
    }
  },
  getPlaceLatLng: async (placeId: string): Promise<LatLng> => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}&language=zh-TW`,
        { method: 'GET' }
      )
      const {
        result: {
          geometry: {
            location: { lat, lng }
          }
        }
      } = await response.json()
      return { latitude: lat, longitude: lng }
    } catch (error) {
      console.error(error)
      return { latitude: 0, longitude: 0 } // TODO: should be null
    }
  },
  getPlaceAutocomplete: async (input: string): Promise<AutocompleteItem[]> => {
    try {
      const query = {
        key: apiKey,
        language: 'zh-TW',
        components: 'country:tw',
        type: ['address', 'establishment']
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
          input
        )}&${Qs.stringify(query)}`,
        { method: 'GET' }
      )
      const { predictions, status } = await response.json()

      if (status !== 'OK') {
        return []
      }

      return predictions.map((item: google.maps.places.AutocompletePrediction) => ({
        title: item.structured_formatting.main_text,
        address: item.structured_formatting.secondary_text ?? '',
        placeId: item.place_id
      }))
    } catch (error) {
      console.log(error)
      return []
    }
  },
  getRoute: async (
    coordinates: Waypoint[]
  ): Promise<Partial<{ polyline: string; legs: any[] }>> => {
    const [origin, ...intermediates] = coordinates
    const destination = intermediates.pop()

    if (origin.latitude === null || destination?.latitude === null) {
      return null
    }
    try {
      const response = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'routes.duration,routes.distanceMeters,routes.legs,routes.polyline,routes.viewport'
        },
        body: JSON.stringify({
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
          computeAlternativeRoutes: false,
          languageCode: 'zh-TW',
          origin: {
            location: {
              latLng: {
                latitude: origin.latitude,
                longitude: origin.longitude
              }
            }
          },
          destination: {
            location: {
              latLng: {
                latitude: destination?.latitude,
                longitude: destination?.longitude
              }
            }
          },
          intermediates: [
            intermediates.map((waypoint) => ({
              location: {
                latLng: {
                  latitude: waypoint.latitude,
                  longitude: waypoint.longitude
                }
              }
            }))
          ]
        })
      })

      const {
        routes: [
          {
            legs,
            polyline: { encodedPolyline }
          }
        ]
      } = await response.json()

      return { polyline: encodedPolyline, legs }
    } catch (error) {
      console.error(error)
      return null
    }
  }
})

export const MapsAPI = initMapsAPI(GOOGLE_MAPS_API_KEY)
