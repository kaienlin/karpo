import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { Button, Text } from "@ui-kitten/components"
import { View } from "react-native"
import { Shadow } from "react-native-shadow-2"
import { Marker } from "react-native-maps"
import { Header } from "~/components/CardHeader"
import MapViewWithRoute from "~/components/MapViewWithRoute"
import { useGetRouteQuery } from "~/redux/maps"
import { PassengerStackParamList } from "~/types/navigation"
import { displayTime } from "~/utils/format"
import { LocationIcon } from "./PassengerRideInfo"
import { Match } from "~/types/data"
import BottomSheet from '@gorhom/bottom-sheet';
import { useMemo, useRef } from "react"

type ArrivingScreenProps = NativeStackScreenProps<PassengerStackParamList, 'ArrivingScreen'>

function ArrivalCard ({ride} : { ride: Match }) {
  // ref
  const bottomSheetRef = useRef<BottomSheet>(null);

  // variables
  const snapPoints = useMemo(() => ['25%'], []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
    >
      <View
        style={{
          position: 'absolute',
          bottom: '2%',
          width: '100%',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          padding: 10,
          backgroundColor: 'white'
        }}
      >        
        <Text style={{ fontSize: 18 }}>
          您的駕駛即將於 {displayTime(ride.pickUpTime.toString(), false)} 抵達約定地點
        </Text>
        <Header 
          rating={ride.driverInfo.rating}
          numAvailableSeat={ride.numAvailableSeat}
          proximity={ride.proximity}
          pickUpTime={ride.pickUpTime.toString()}
          dropOffTime={ride.dropOffTime.toString()}
          fare={ride.fare}
        />
        <View style={{ 
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 10,
          padding: 10
        }}> 
          <View style={{ flex: 1}}>
            <Button status="danger">取消預約</Button>
          </View>
          <View style={{ flex: 1}}>
            <Button>傳訊息給駕駛</Button>
          </View>
        </View>
      </View>
    </BottomSheet>
  )
}

export default function Arriving({ route, navigation }: ArrivingScreenProps) {
  const { ride } = route.params

  const { data: driverRoute } = useGetRouteQuery(
    [ride.driverOrigin, ride.pickUpLocation]
  )
  
  return (
    <>
      <MapViewWithRoute
        route={driverRoute?.route}
        edgePadding={{ top: 80, right: 80, left: 80, bottom: 80 }}
        fitToRouteButtonPosition={{ left: '86%', bottom: '40%' }}
      >
        <Marker coordinate={ride.pickUpLocation}>
          <LocationIcon />
        </Marker>
        <Marker
          anchor={{ x: 0.5, y: 2 }}
          coordinate={ride.pickUpLocation}
        >
          <Shadow>
            <View
              style={{
                width: 80,
                alignItems: 'center',
                backgroundColor: 'white',
                paddingHorizontal: 10,
                paddingVertical: 5
              }}
            >
              <Text category="label">上車地點</Text>
              {/* TODO: indicate duration and distance on polyline <Text category="label">{`步行時間${walkingRoute?.duration}`}</Text> */}
            </View>
          </Shadow>
        </Marker>
      </MapViewWithRoute>
      <ArrivalCard ride={ride} />      
    </>
  )
}

const shadowPresets = {
  modal: {
    stretch: true,
    startColor: '#00000025',
    sides: {
      start: true,
      end: true,
      top: false,
      bottom: true
    },
    corners: {
      topStart: false,
      topEnd: false,
      bottomStart: true,
      bottomEnd: true
    }
  }
}