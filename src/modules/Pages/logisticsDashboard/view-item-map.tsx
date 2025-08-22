import { useParams } from "react-router-dom";
import { useItemMap } from "../../../store/useTempStore";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function ViewItemMap() {
  const { id } = useParams();
  const item = useItemMap((state) => state.item);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const coordinates = item.product.creator.profile.coordinates;
  const defaultProps = {
    center: {
      lat: coordinates ? parseFloat(coordinates.latitude) : 10.99835602,
      lng: coordinates ? parseFloat(coordinates.longitude) : 77.01502627,
    },
    zoom: 11,
  };
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          toast.error(
            "Unable to retrieve your location. Please allow location access.",
          );
          console.error("Geolocation error:", error);
        },
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  }, []);
  const handleApiLoaded = (map: any, maps: any) => {
    if (userLocation && coordinates) {
      const directionsService = new maps.DirectionsService();
      const directionsRenderer = new maps.DirectionsRenderer();
      directionsRenderer.setMap(map);
      // Calculate directions
      directionsService.route(
        {
          origin: new maps.LatLng(userLocation.lat, userLocation.lng),
          destination: new maps.LatLng(
            parseFloat(coordinates.latitude),
            parseFloat(coordinates.longitude),
          ),
          travelMode: maps.TravelMode.DRIVING,
        },
        (
          result: google.maps.DirectionsResult,
          status: google.maps.DirectionsStatus,
        ) => {
          if (status === maps.DirectionsStatus.OK) {
            setDirections(result);
            directionsRenderer.setDirections(result);
          } else {
            toast.error("Failed to calculate directions.");
            console.error("Directions request failed due to " + status);
          }
        },
      );
    }
  };
  return (
    <div data-theme="nord" className="flex flex-col h-full">
      <div className="px-6 py-4 bg-base-200 border-b border-base-300 flex items-center">
        <button
          onClick={() => window.history.back()}
          className="btn btn-ghost btn-sm mr-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-base-content">
          Pickup Location for{" "}
          <span className="text-primary">{item.product.name}</span>
        </h1>
      </div>
      <div className="flex-1 relative">
        <GoogleMapReact
          bootstrapURLKeys={{ key: "AIzaSyBstumBKZoQNTHm3Y865tWEHkkFnNiHGGE" }}
          defaultCenter={defaultProps.center}
          defaultZoom={defaultProps.zoom}
          yesIWantToUseGoogleMapApiInternals
          onGoogleApiLoaded={({ map, maps }) => handleApiLoaded(map, maps)}
          options={{
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
