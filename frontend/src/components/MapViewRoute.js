import { useState, useEffect, useMemo } from "react";
import { Polyline } from "react-native-maps";
import { decode as decodePolyline } from "@mapbox/polyline";

export default function Route({ query, polylineStyle, onRouteChange }) {
  const { key, waypoints } = query;
  const [polyline, setPolyline] = useState("");
  const [viewport, setViewport] = useState();

  const steps = useMemo(
    () =>
      decodePolyline(polyline).map(([lat, lng]) => ({
        latitude: lat,
        longitude: lng,
      })),
    [polyline]
  );

  useEffect(() => {
    const fetchRoute = async () => {
      const [origin, ...intermediates] = waypoints;
      const destination = intermediates.pop();

      if (!origin.lat || !destination.lat) {
        return;
      }

      const response = await fetch(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key,
            "X-Goog-FieldMask":
              "routes.duration,routes.distanceMeters,routes.legs,routes.polyline,routes.viewport",
          },
          body: JSON.stringify({
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
            computeAlternativeRoutes: false,
            languageCode: "zh-TW",
            origin: {
              location: {
                latLng: {
                  latitude: origin.lat,
                  longitude: origin.lng,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: destination.lat,
                  longitude: destination.lng,
                },
              },
            },
            intermediates: [
              intermediates.map((waypoint) => ({
                location: {
                  latLng: {
                    latitude: waypoint.lat,
                    longitude: waypoint.lng,
                  },
                },
              })),
            ],
          }),
        }
      );
      const data = await response.json();

      setPolyline(data.routes[0].polyline.encodedPolyline);
      setViewport(data.routes[0].viewport);
    };

    fetchRoute().catch(console.error);
  }, [waypoints]);

  useEffect(() => {
    if (viewport) {
      const { high, low } = viewport;
      onRouteChange([
        { latitude: high.latitude + 0.005, longitude: high.longitude + 0.01 },
        { latitude: low.latitude - 0.005, longitude: low.longitude - 0.01 },
      ]);
    }
  }, [viewport]);

  return <Polyline coordinates={steps} {...polylineStyle} />;
}
