import { useEffect, useRef } from 'react'
import { TouchableOpacity, View, type FlexStyle } from 'react-native'
import MapView, { Polyline, type EdgePadding, type MapViewProps } from 'react-native-maps'
import { Shadow } from 'react-native-shadow-2'
import { Icon } from '@ui-kitten/components'

interface MapViewWithRouteProps extends MapViewProps {
  route: LatLng[] | undefined
  edgePadding?: Partial<EdgePadding>
  fitToRouteButtonPosition?: Pick<FlexStyle, 'left' | 'right' | 'bottom' | 'top' | 'start' | 'end'>
}

const defaultEdgePadding: EdgePadding = { top: 50, right: 60, left: 60, bottom: 100 }

export default function MapViewWithRoute({
  route,
  children,
  edgePadding,
  fitToRouteButtonPosition = { left: '86%', bottom: '22%' },
  ...props
}: MapViewWithRouteProps) {
  const mapRef = useRef<MapView>(null)

  const fitToRoute = () => {
    if (route) {
      mapRef.current?.fitToCoordinates(route, {
        edgePadding: { ...defaultEdgePadding, ...edgePadding }
      })
    }
  }

  useEffect(() => {
    fitToRoute()
  }, [])

  useEffect(() => {
    fitToRoute()
  }, [route, edgePadding])

  return (
    <>
      <MapView
        {...props}
        ref={mapRef}
        style={{ flex: 1, width: '100%', height: '100%' }}
        provider="google"
        showsUserLocation={true}
      >
        {route && <Polyline coordinates={route} strokeWidth={5} strokeColor="#484848" />}
        {children}
      </MapView>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={fitToRoute}
        style={[{ position: 'absolute', zIndex: 0 }, fitToRouteButtonPosition]}
      >
        <Shadow startColor="#00000010">
          <View
            style={{
              backgroundColor: 'white',
              padding: 8,
              borderRadius: 100
            }}
          >
            <Icon style={{ width: 23, height: 23, zIndex: 1 }} name="navigation-2" />
          </View>
        </Shadow>
      </TouchableOpacity>
    </>
  )
}
