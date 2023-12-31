import { useEffect, useState } from 'react'
import { set } from 'date-fns'
import * as Location from 'expo-location'

export const useCurrentLocation = () => {
  const [location, setLocation] = useState<LatLng | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)

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
          setLocation({ latitude: data.coords.latitude, longitude: data.coords.longitude })
          setIsSuccess(true)
        }
      })
      .catch(console.log)
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  return { location, isSuccess, isLoading }
}
