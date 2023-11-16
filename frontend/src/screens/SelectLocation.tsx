import { useState, useEffect, useRef, useMemo } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import * as Location from 'expo-location'
import Qs from 'qs'
import {
  Button,
  Divider,
  Icon,
  Input,
  ListItem,
  Text,
  TopNavigationAction,
  type IconProps,
  type ListItemProps
} from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import MapView, { type Details, type Region } from 'react-native-maps'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'

import { GOOGLE_MAPS_API_KEY } from '@env'
import { updateWaypoint } from '../redux/waypoints'
import { type RootState } from '../redux/store'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />
const LocIcon = (props: IconProps) => <Icon {...props} name="pin-outline" />
const PinIcon = (props: IconProps) => <Icon {...props} name="pin" />

const getPlaceLatLng = async (key: string, placeId: string) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${key}&language=zh-TW`,
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
  }
}

const getPlaceTitle = async (key: string, coordinate: LatLng) => {
  try {
    const { latitude, longitude } = coordinate
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${key}&language=zh-TW&location_type=ROOFTOP`,
      { method: 'GET' }
    )

    const data = await response.json()

    if (data.status === 'OK') {
      const addressComponents = data.results[0].address_components
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
    }
    return '未命名的道路'
  } catch (error) {
    console.log(error)
  }
}

const getPlaceAutoComplete = async (key: string, input: string) => {
  try {
    const query = {
      key,
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
    const data = await response.json()

    return data
  } catch (error) {
    console.log(error)
  }
}

interface AutocompleteItemProps extends ListItemProps {
  title: string
  address: string
}

function AutocompleteItem({ title, address, ...props }: AutocompleteItemProps) {
  return (
    <ListItem
      {...props}
      style={{ paddingHorizontal: 20, height: 55 }}
      title={(evaProps) => <Text style={[evaProps?.style, { fontSize: 14 }]}>{title}</Text>}
      description={
        address.length === 0
          ? undefined
          : (evaProps) => (
              <Text style={[evaProps?.style, { fontSize: 13, marginTop: 3 }]}>{address}</Text>
            )
      }
      accessoryLeft={() => <LocIcon style={{ width: 20, height: 20 }} />}
    />
  )
}

type SelectLocationScreenProps = NativeStackScreenProps<HomeStackParamList, 'SelectLocationScreen'>

export default function SelectLocationScreen({ navigation, route }: SelectLocationScreenProps) {
  const { waypointIndex } = route.params
  const defaultSearchInput = useSelector((state: RootState) => state.waypoints[waypointIndex].title)

  const dispatch = useDispatch()
  const inputRef = useRef<Input>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ['20%', '90%'], [])

  const [searchInput, setSearchInput] = useState<string>('')
  const [center, setCenter] = useState<Region | null>(null)
  const [autocompleteResult, setAutocompleteResult] = useState<AutocompleteItem[]>([])

  useEffect(() => {
    if (inputRef.current !== null) {
      inputRef.current.focus()
    }
    setSearchInput(defaultSearchInput)
  }, [])

  useEffect(() => {
    const getCurrentPosition = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') {
        return
      }

      const deltas = { latitudeDelta: 0.002, longitudeDelta: 0.005 }
      const last = await Location.getLastKnownPositionAsync()
      if (last !== null) {
        setCenter({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
          ...deltas
        })
      } else {
        const current = await Location.getCurrentPositionAsync()
        setCenter({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          ...deltas
        })
      }
    }
    getCurrentPosition().catch(console.error)
  }, [])

  const handleChangeSearchInput = (text: string) => {
    setSearchInput(text)
    void (async () => {
      const autocompleteData = await getPlaceAutoComplete(GOOGLE_MAPS_API_KEY, text)
      if (autocompleteData.status === 'OK') {
        setAutocompleteResult(
          autocompleteData.predictions.map((item: google.maps.places.AutocompletePrediction) => ({
            title: item.structured_formatting.main_text,
            address: item.structured_formatting.secondary_text ?? '',
            placeId: item.place_id
          }))
        )
      }
    })()
  }

  const handlePressLocationItem = (item: AutocompleteItem) => {
    void (async () => {
      const latlng = await getPlaceLatLng(GOOGLE_MAPS_API_KEY, item.placeId)
      dispatch(
        updateWaypoint({
          index: waypointIndex,
          location: { title: item.title, ...latlng }
        })
      )
    })()

    navigation.goBack()
  }

  const handleRegionChangeComplete = (region: Region, details: Details) => {
    if (details.isGesture === true) {
      void (async () => {
        const title = await getPlaceTitle(GOOGLE_MAPS_API_KEY, region)
        setSearchInput(title)
      })()
      setCenter(region)
    }
  }

  const handlePressConfirm = () => {
    dispatch(
      updateWaypoint({
        index: waypointIndex,
        location: {
          title: searchInput,
          latitude: center?.latitude,
          longitude: center?.longitude
        }
      })
    )
    navigation.goBack()
  }

  const renderClearIcon = (props: IconProps) => (
    <TouchableWithoutFeedback
      onPress={() => {
        setSearchInput('')
        setAutocompleteResult([])
      }}
    >
      <Icon {...props} name="close-circle-outline" />
    </TouchableWithoutFeedback>
  )

  const renderLocationItem = ({ item, index }: { item: AutocompleteItem; index: number }) => (
    <>
      <AutocompleteItem
        title={item.title}
        address={item.address}
        onPress={() => {
          handlePressLocationItem(autocompleteResult[index])
        }}
      />
      <Divider />
    </>
  )

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.topHeader}>
        <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
        <Input
          ref={inputRef}
          style={{ flex: 1 }}
          placeholder="要去哪裡？"
          accessoryRight={searchInput.length > 0 ? renderClearIcon : undefined}
          value={searchInput}
          onChangeText={handleChangeSearchInput}
          onFocus={() => {
            if (bottomSheetRef.current !== null) {
              bottomSheetRef.current.expand()
            }
          }}
        />
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        style={{ zIndex: 1 }}
        index={1}
        topInset={30}
        snapPoints={snapPoints}
        onChange={(index) => {
          if (inputRef.current !== null) {
            if (index === 1) {
              inputRef.current.focus()
            } else {
              inputRef.current.blur()
            }
          }
        }}
      >
        <View style={{ flex: 1 }}>
          <BottomSheetFlatList
            data={autocompleteResult}
            renderItem={renderLocationItem}
            keyboardShouldPersistTaps="always"
            ListEmptyComponent={
              <AutocompleteItem
                title="在地圖上設定地點"
                address=""
                onPress={() => {
                  if (bottomSheetRef.current !== null) {
                    bottomSheetRef.current.collapse()
                  }
                }}
              />
            }
          />
        </View>
      </BottomSheet>

      <View style={{ flex: 1, zIndex: -1 }}>
        {center !== null ? (
          <MapView
            style={{ flex: 1, width: '100%', height: '100%' }}
            provider="google"
            showsUserLocation={true}
            onRegionChange={() => {
              if (bottomSheetRef.current !== null) {
                bottomSheetRef.current.close()
              }
            }}
            onRegionChangeComplete={handleRegionChangeComplete}
            initialRegion={center}
          ></MapView>
        ) : null}
        <View style={styles.centerPinContainer}>
          <PinIcon style={styles.centerPin} />
        </View>
        <View style={styles.confirmButtonContainer}>
          <Button size="large" style={styles.confirmButton} onPress={handlePressConfirm}>
            完成
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    zIndex: 5
  },
  centerPinContainer: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginTop: -38,
    marginLeft: -20
  },
  centerPin: {
    width: 40,
    height: 40
  },
  confirmButtonContainer: {
    position: 'absolute',
    top: '90%',
    width: '100%',
    paddingHorizontal: 20
  },
  confirmButton: {
    borderRadius: 12
  }
})
