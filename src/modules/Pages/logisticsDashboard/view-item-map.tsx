import { useParams } from "react-router-dom";
import { useItemMap } from "../../../store/useTempStore";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BackButton } from "../salesDashboard/ViewVendorDetails";
import {
  GoogleMap,
  useJsApiLoader,
  DirectionsRenderer,
  DirectionsService,
} from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "520px",
};

export default function ViewItemMap() {
  const item = useItemMap((state) => state.item);
  const coordinates = item?.product?.creator?.profile?.coordinates;

  const destination = coordinates
    ? {
        lat: parseFloat(coordinates.latitude),
        lng: parseFloat(coordinates.longitude),
      }
    : null;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBstumBKZoQNTHm3Y865tWEHkkFnNiHGGE", // move this to env var ideally
    libraries: ["places"],
  });

  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);

  // Get user location once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        (err) => {
          toast.error("Enable location services to see directions.");
          console.error(err);
        },
      );
    }
  }, []);

  if (!isLoaded) return <>Loading map…</>;
  if (!destination) return <>No destination provided.</>;

  const center = userLocation || destination;

  return (
    <div className="flex flex-col h-full">
      <div className="py-2 flex items-center mb-2">
        <button
          onClick={() => window.history.back()}
          className="btn btn-ghost btn-xs mr-2"
        >
          <BackButton />
        </button>
        <h1 className="text-lg font-bold">
          Pickup Location for{" "}
          <span className="text-primary">{item?.product?.name}</span>
        </h1>
      </div>

      <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={11}>
        {/* Request directions when we have both points */}
        {userLocation && destination && !directions && (
          <DirectionsService
            options={{
              origin: userLocation,
              destination: destination,
              travelMode: google.maps.TravelMode.DRIVING,
            }}
            callback={(res, status) => {
              if (status === "OK" && res) {
                setDirections(res);
              } else {
                toast.error("Could not calculate directions.");
                console.error("DirectionsService failed:", status);
              }
            }}
          />
        )}

        {/* Render the route */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>
    </div>
  );
}
