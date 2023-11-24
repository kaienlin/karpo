import { useState, useRef } from 'react'
import { View } from 'react-native'
import { Toggle, Text, Avatar, Button } from '@ui-kitten/components'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import MapView from 'react-native-maps'
import { Header } from '../components/CardHeader'

type RideInfoScreenProps = NativeStackScreenProps<HomeStackParamList, 'RideInfoScreen'>

export default function RideInfo ({ route, navigation }: RideInfoScreenProps) {
  const [checked, setChecked] = useState(false);
  const [toggleNote, setToggleNote] = useState('上車')
  const onCheckedChange = (isChecked: boolean): void => {
    setChecked(isChecked);
    if(isChecked) setToggleNote('下車')
    else setToggleNote('上車')
  };
  
  const mapRef = useRef<MapView>(null)
  
  return (
    <>
      <View style={{ padding: 10 }}>
        <Header {...route.params} />
      </View>
      
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between',
        alignContent: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10
      }}>
        <Text style={{ fontSize: 18 }}>行駛路線</Text>
        <Toggle
          checked={checked}
          onChange={onCheckedChange}
        >
          {evaProps => <Text {...evaProps}>{toggleNote}</Text>}
        </Toggle>
      </View>
      
      <MapView
        ref={mapRef}
        style={{ flex: 2, width: '100%' }}
        provider="google"
        showsMyLocationButton={true}
        showsUserLocation={true}
      ></MapView>
      
      <View style={{ flex: 1, padding: 20 }}>
        <Text style={{ fontSize: 18 }}>其他乘客</Text>
        <View style={{ flexDirection: 'row', paddingVertical: 10 }}>
          <View style={{ padding: 10, alignItems: 'center', gap: 5 }}>
            <Avatar
              source={require('../../assets/yia.jpg')}
              size='giant'
            />
            <Text>yia</Text>
          </View>
          <View style={{ padding: 10, alignItems: 'center', gap: 5 }}>
            <Avatar
              source={require('../../assets/poprice.jpg')}
              size='giant'
            />
            <Text>米香</Text>
          </View>
        </View>
      </View>
      <View style={{ paddingVertical: 10 }}>
        <Button 
          style={{ 
            borderRadius: 30,
            marginVertical: 10,
            marginHorizontal: 40,
          }}
        >預    約</Button>
      </View>
    </>
  )
}