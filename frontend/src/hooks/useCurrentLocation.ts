import { useEffect, useState } from 'react'
import * as Location from 'expo-location'

export const useCurrentLocation = () => {
  const [position, setPosition] = useState<LatLng | null>(null)
  useEffect(() => {
    const getCurrentPosition = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        return
      }

      const last = await Location.getLastKnownPositionAsync()
      if (last !== null) {
        return last
      } else {
        const current = await Location.getCurrentPositionAsync()
        return current
      }
    }
    getCurrentPosition()
      .then((data) => {
        if (data) {
          setPosition({ latitude: data.coords.latitude, longitude: data.coords.longitude })
        }
      })
      .catch(console.log)
  }, [])

  return position
}
