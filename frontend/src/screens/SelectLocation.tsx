import { useEffect, useMemo, useRef, useState } from 'react'
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet'
import { type NativeStackScreenProps } from '@react-navigation/native-stack'
import {
  Button,
  Divider,
  Icon,
  Input,
  ListItem,
  Spinner,
  Text,
  TopNavigationAction,
  type IconProps,
  type ListItemProps
} from '@ui-kitten/components'
import * as Location from 'expo-location'
import MapView, { type Details, type Region } from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useDispatch, useSelector } from 'react-redux'

import { type RootState } from '../redux/store'
import { updateWaypoint } from '../redux/waypoints'
import { MapsAPI } from '../services/maps'

const BackIcon = (props: IconProps) => <Icon {...props} name="arrow-back" />
const LocIcon = (props: IconProps) => <Icon {...props} name="pin-outline" />
const PinIcon = (props: IconProps) => <Icon {...props} name="pin" />

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
  const defaultCenter = useSelector((state: RootState) => state.waypoints[waypointIndex])

  const dispatch = useDispatch()
  const inputRef = useRef<Input>(null)
  const bottomSheetRef = useRef<BottomSheet>(null)
  const snapPoints = useMemo(() => ['20%', '90%'], [])

  const [searchInput, setSearchInput] = useState<string>('')
  const [center, setCenter] = useState<Region | null>(null)
  const [autocompleteResult, setAutocompleteResult] = useState<AutocompleteItem[]>([])

  useEffect(() => {
    if (defaultCenter.latitude !== null && defaultCenter.longitude !== null) {
      setSearchInput(defaultCenter.title)
      setCenter({
        latitude: defaultCenter.latitude,
        longitude: defaultCenter.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.005
      })
    } else {
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
    }
  }, [])

  const handleChangeSearchInput = (text: string) => {
    setSearchInput(text)
    void (async () => {
      const result = await MapsAPI.getPlaceAutocomplete(text)
      setAutocompleteResult(result)
    })()
  }

  const handlePressLocationItem = (item: AutocompleteItem) => {
    void (async () => {
      const latlng = await MapsAPI.getPlaceLatLng(item.placeId)
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
        const title = await MapsAPI.getPlaceTitle(region)
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
          autoFocus={true}
          placeholder="要去哪裡？"
          accessoryRight={searchInput.length > 0 ? renderClearIcon : undefined}
          value={searchInput}
          onChangeText={handleChangeSearchInput}
          onFocus={() => {
            bottomSheetRef.current?.expand()
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
          if (index === 1) {
            inputRef.current?.focus()
          } else {
            inputRef.current?.blur()
          }
        }}
      >
        <View style={{ flex: 1 }}>
          <BottomSheetFlatList
            data={autocompleteResult}
            renderItem={renderLocationItem}
            keyboardShouldPersistTaps="always"
            ListHeaderComponent={
              <AutocompleteItem
                title="在地圖上設定地點"
                address=""
                onPress={() => {
                  bottomSheetRef.current?.collapse()
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
              inputRef.current?.blur()
              bottomSheetRef.current?.close()
            }}
            onRegionChangeComplete={handleRegionChangeComplete}
            initialRegion={center}
          ></MapView>
        ) : (
          <Spinner />
        )}
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
