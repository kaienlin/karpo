import { useState, useEffect, useMemo } from 'react'
import { Polyline, type MapPolylineProps } from 'react-native-maps'
import { decode as decodePolyline } from '@mapbox/polyline'

interface RouteProps {
  query: {
    key: string
    coordinates: Waypoint[]
  }
  polylineStyle: Omit<MapPolylineProps, 'coordinates'>
  onRouteChange: (coordinates: LatLng[]) => void
}

export default function Route ({ query, polylineStyle, onRouteChange }: RouteProps) {
  const { key, coordinates } = query
  const [polyline, setPolyline] = useState<string | null>(null)
  const [viewport, setViewport] = useState<Viewport | null>(null)

  const steps = useMemo(
    () => {
      if (polyline !== null) {
        return decodePolyline(polyline).map(([lat, lng]: number[]) => ({
          latitude: lat,
          longitude: lng
        }))
      }
    },
    [polyline]
  )

  useEffect(() => {
    const fetchRoute = async () => {
      const [origin, ...intermediates] = coordinates
      const destination = intermediates.pop()

      if (origin.latitude === null || destination?.latitude === null) {
        return
      }

      try {
        const response = await fetch(
          'https://routes.googleapis.com/directions/v2:computeRoutes',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Goog-Api-Key': key,
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
          }
        )
        const data = await response.json()

        setPolyline(data.routes[0].polyline.encodedPolyline)
        setViewport(data.routes[0].viewport)
      } catch (error) {
        console.error(error)
      }
    }

    fetchRoute().catch(console.error)
  }, [coordinates])

  useEffect(() => {
    if (viewport !== null) {
      const { high, low } = viewport
      onRouteChange([
        { latitude: high.latitude + 0.005, longitude: high.longitude + 0.01 },
        { latitude: low.latitude - 0.005, longitude: low.longitude - 0.01 }
      ])
    }
  }, [viewport])

  return <Polyline coordinates={steps} {...polylineStyle} />
}
