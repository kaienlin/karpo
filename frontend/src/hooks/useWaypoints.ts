import { useEffect } from 'react'
import { useFieldArray, type Control } from 'react-hook-form'
import { useRoute } from '@react-navigation/native'

export const useWaypoints = (control: Control<any>) => {
  const route = useRoute()
  const { updatedWaypoint } = route?.params ?? {}

  const { fields, update, append, remove } = useFieldArray<{ waypoints: Waypoint[] }>({
    control,
    name: 'waypoints'
  })

  useEffect(() => {
    const { index, payload } = updatedWaypoint ?? {}
    update(index, payload)
  }, [updatedWaypoint])

  return { fields, update, append, remove }
}
