import { useState, useEffect, useRef, useMemo } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import * as Location from "expo-location";
import Qs from "qs";
import {
  Button,
  Divider,
  Icon,
  Input,
  ListItem,
  Text,
  TopNavigationAction,
} from "@ui-kitten/components";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView from "react-native-maps";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";

import { GOOGLE_MAPS_API_KEY } from "@env";
import { updateWaypoint } from "../redux/waypoints";

const BackIcon = (props) => <Icon {...props} name="arrow-back" />;
const LocIcon = (props) => <Icon {...props} name="pin-outline" />;
const PinIcon = (props) => <Icon {...props} name="pin" />;

const getPlaceLatLng = async (key, place_id) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${key}&language=zh-TW`,
    { method: "GET" }
  );
  const {
    result: {
      geometry: { location },
    },
  } = await response.json();

  return location;
};

const getPlaceTitle = async (key, lat, lng) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}&language=zh-TW&location_type=ROOFTOP`,
      { method: "GET" }
    );

    const data = await response.json();

    if (data.status === "OK") {
      const addressComponents = data.results[0].address_components;
      const premise = addressComponents.find((comp) =>
        comp.types.includes("premise")
      );
      if (premise) {
        return premise.long_name;
      }

      const streetNumber = addressComponents.find((comp) =>
        comp.types.includes("street_number")
      );
      const route = addressComponents.find((comp) =>
        comp.types.includes("route")
      );

      return `${route.long_name}${streetNumber.long_name}${
        streetNumber.long_name.endsWith("號") ? "" : "號"
      }`;
    }
  } catch (error) {
    console.log(error);
  }
};

const getPlaceAutoComplete = async (key, input) => {
  try {
    const query = {
      key: GOOGLE_MAPS_API_KEY,
      language: "zh-TW",
      components: "country:tw",
      type: ["address", "establishment"],
    };

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&${Qs.stringify(query)}`,
      { method: "GET" }
    );
    const data = await response.json();

    return data;
  } catch (error) {
    console.log(error);
  }
};

function AutocompleteItem({ title, address, ...props }) {
  return (
    <ListItem
      {...props}
      style={{ paddingHorizontal: 20, height: 55 }}
      title={(evaProps) => (
        <Text style={[...evaProps.style, { fontSize: 14 }]}>{title}</Text>
      )}
      description={(evaProps) =>
        address && (
          <Text style={[...evaProps.style, { fontSize: 13, marginTop: 3 }]}>
            {address}
          </Text>
        )
      }
      accessoryLeft={() => <LocIcon style={{ width: 20, height: 20 }} />}
    />
  );
}

const initialAutocompleteResultState = [
  { title: "在地圖上設定地點", address: "", place_id: "" },
];

export default function SelectLocationScreen({ navigation, route }) {
  const { waypointIndex } = route.params;
  const dispatch = useDispatch();
  const defaultSearchInput = useSelector(
    (state) => state.waypoints[waypointIndex].title
  );

  const inputRef = useRef(null);
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["20%", "90%"], []);

  const [searchInput, setSearchInput] = useState("");
  const [center, setCenter] = useState(null);
  const [autocompleteResult, setAutocompleteResult] = useState(
    initialAutocompleteResultState
  );

  useEffect(() => {
    inputRef.current.focus();
    setSearchInput(defaultSearchInput);
  }, []);

  useEffect(() => {
    const getCurrentPosition = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const deltas = { latitudeDelta: 0.002, longitudeDelta: 0.005 };
      const last = await Location.getLastKnownPositionAsync();
      if (last) {
        setCenter({
          latitude: last.coords.latitude,
          longitude: last.coords.longitude,
          ...deltas,
        });
      } else {
        const current = await Location.getCurrentPositionAsync();
        setCenter({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          ...deltas,
        });
      }
    };
    getCurrentPosition().catch(console.error);
  }, []);

  const handleChangeSearchInput = async (text) => {
    setSearchInput(text);
    const autocompleteData = await getPlaceAutoComplete(
      GOOGLE_MAPS_API_KEY,
      text
    );
    setAutocompleteResult([
      ...initialAutocompleteResultState,
      ...autocompleteData.predictions.map((item) => ({
        title: item.structured_formatting.main_text,
        address: item.structured_formatting.secondary_text,
        place_id: item.place_id,
      })),
    ]);
  };

  const handlePressLocationItem = async (item) => {
    const latlng = await getPlaceLatLng(GOOGLE_MAPS_API_KEY, item.place_id);

    dispatch(
      updateWaypoint({
        index: waypointIndex,
        location: { title: item.title, ...latlng },
      })
    );
    navigation.goBack();
  };

  const handleRegionChangeComplete = async (region, details) => {
    if (details.isGesture) {
      const title = await getPlaceTitle(
        GOOGLE_MAPS_API_KEY,
        region.latitude,
        region.longitude
      );
      setSearchInput(title);
      setCenter(region);
    }
  };

  const handlePressConfirm = async () => {
    dispatch(
      updateWaypoint({
        index: waypointIndex,
        location: {
          title: searchInput,
          lat: center.latitude,
          lng: center.longitude,
        },
      })
    );
    navigation.goBack();
  };

  const renderClearIcon = (props) => (
    <TouchableWithoutFeedback
      onPress={() => {
        setSearchInput("");
        setAutocompleteResult(initialAutocompleteResultState);
      }}
    >
      <Icon {...props} name="close-circle-outline" />
    </TouchableWithoutFeedback>
  );

  const renderLocationItem = ({ item, index }) => (
    <>
      <AutocompleteItem
        title={item.title}
        address={item.address}
        onPress={() => {
          if (item.title === "在地圖上設定地點") {
            bottomSheetRef.current.collapse();
          } else {
            handlePressLocationItem(autocompleteResult[index]);
          }
        }}
      />
      <Divider />
    </>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.topHeader}>
        <TopNavigationAction icon={BackIcon} onPress={navigation.goBack} />
        <Input
          ref={inputRef}
          style={{ flex: 1 }}
          placeholder="要去哪裡？"
          accessoryRight={searchInput && renderClearIcon}
          value={searchInput}
          onChangeText={handleChangeSearchInput}
          onFocus={() => {
            bottomSheetRef.current.expand();
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
            inputRef.current.focus();
          } else {
            inputRef.current.blur();
          }
        }}
      >
        <View style={{ flex: 1 }}>
          <BottomSheetFlatList
            data={autocompleteResult}
            renderItem={renderLocationItem}
            keyboardShouldPersistTaps="always"
          />
        </View>
      </BottomSheet>

      <View style={{ flex: 1, zIndex: -1 }}>
        {center && (
          <MapView
            style={{ flex: 1, width: "100%", height: "100%" }}
            provider="google"
            showsUserLocation={true}
            onRegionChange={() => {
              bottomSheetRef.current.close();
            }}
            onRegionChangeComplete={handleRegionChangeComplete}
            initialRegion={center}
          ></MapView>
        )}
        <View style={styles.centerPinContainer}>
          <PinIcon style={styles.centerPin} />
        </View>
        <View style={styles.confirmButtonContainer}>
          <Button
            size="large"
            style={styles.confirmButton}
            onPress={handlePressConfirm}
          >
            完成
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    zIndex: 5,
  },
  centerPinContainer: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginTop: -38,
    marginLeft: -20,
  },
  centerPin: {
    width: 40,
    height: 40,
  },
  confirmButtonContainer: {
    position: "absolute",
    top: "90%",
    width: "100%",
    paddingHorizontal: 20,
  },
  confirmButton: {
    borderRadius: "12%",
  },
});
