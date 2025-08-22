import { useParams } from "react-router-dom";
import { useItemMap } from "../../../store/useTempStore";
import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { BackButton } from "../salesDashboard/ViewVendorDetails";

export default function ViewItemMap() {
  const { id } = useParams();
  const item = useItemMap((state) => state.item);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
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
    <div data-theme="nord" className="flex bg-transparent  flex-col h-full">
      <div className="py-2  flex items-center mb-2">
        <button
          onClick={() => window.history.back()}
          className="btn btn-ghost btn-xs mr-2"
        >
          <BackButton />
        </button>
        <h1 className="text-lg font-bold ">
          Pickup Location for{" "}
          <span className="text-primary">{item.product.name}</span>
        </h1>
      </div>
      <div className="flex-1 relative  shadow-inner rounded-lg overflow-hidden">
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
              {
                featureType: "road",
                elementType: "geometry",
                stylers: [{ color: "#ffffff" }],
              },
              {
                featureType: "water",
                elementType: "geometry",
                stylers: [{ color: "#c9e7ff" }],
              },
            ],
          }}
        />
      </div>
      <div className="p-4 bg-base-200 border-t border-base-300">
        <p className="text-sm text-secondary">
          Note: The map above shows the pickup location for your selected item.
          Please ensure you have enabled location services for accurate
          directions.
        </p>
      </div>
    </div>
  );
}
