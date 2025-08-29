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
import { MessageCircleIcon, PhoneIcon } from "lucide-react";
import CustomBackbtn from "../../../components/CustomBackBtn";

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

  const [distanceKm, setDistanceKm] = useState<string | null>(null);

  // Subscribe to realtime location updates
  useEffect(() => {
    let watchId: number | null = null;

    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
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

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // if (!isLoaded) return <>Loading map…</>;
  // if (!destination) return <>No destination provided.</>;

  const center = userLocation || destination;

  return (
    <div className="flex flex-col h-full bg-transparent" data-theme="nord">
      <div className="mb-2 bg-transparent w-fit">
        <CustomBackbtn />
      </div>
      <div className="grid  grid-cols-1 md:flex gap-2 flex-1">
        <div className="md:w-sm h-full bg-base-100 p-2">
          <div className="text-2xl font-semibold my-2 text-primary mb-4">
            Delivery & Item Info
          </div>
          <div className="bg-base-100 p-3 rounded-md ring-1 ring-primary/20 shadow-md">
            <div className="flex items-center">
              <div className="label text-xs">{item.id}</div>{" "}
              <span className="badge badge-primary badge-soft outline outline-current/50 ml-auto">
                {item.product.style ? "clothe" : "fabric"}
              </span>
            </div>
            <div className="text-2xl font-bold text-primary my-3">
              {directions?.routes[0]?.legs[0]?.distance?.text || "Calculating…"}
            </div>
            <div className="my-2">
              <span className="label">Pickup Location</span>
              <div className="text-xs">
                {item.product.creator.profile.address}
              </div>
            </div>
            <div className="divider my-1"></div>
            <section className="flex items-center gap-2">
              <div>
                <img
                  className="size-10 rounded-full"
                  src={item.product.creator.profile.profile_picture}
                  alt=""
                />
              </div>
              <div>
                <div>{item.product.creator.name}</div>
                <span className="label">{item.product.creator.role.name}</span>
              </div>
              <div className="ml-auto flex gap-2">
                <button className="btn btn-circle btn-clean">
                  <PhoneIcon size={18} />
                </button>
                <button className="btn btn-circle btn-clean">
                  <MessageCircleIcon size={18} />
                </button>
              </div>
            </section>
          </div>
          <section className="bg-base-100 p-3 rounded-md ring-1 ring-primary/20 shadow-lg mt-3">
            <div className="grid grid-cols-2 gap-2">
              {item.product.fabric && (
                <>
                  <img
                    loading="lazy"
                    className="w-full  size-32 object-cover rounded-md"
                    src={item.product.fabric.photos[0]}
                    alt="Fabric"
                  />
                  <img
                    loading="lazy"
                    className="w-full h-32 object-cover rounded-md"
                    src={item.product.fabric?.photos[1]}
                    alt="Fabric"
                  />
                </>
              )}
              {item.product.style && (
                <>
                  <img
                    className="w-full h-32 object-cover rounded-md"
                    src={item.product.style.photos[0]}
                    alt="Style"
                  />
                  <img
                    className="w-full h-32 object-cover rounded-md"
                    src={item.product.style.photos[1]}
                    alt="Style"
                  />
                </>
              )}
            </div>
          </section>
        </div>
        <div className="bg-base-200 rounded-xl  flex-1 overflow-hidden">
          {isLoaded && center && (
            <>
              {" "}
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={11}
              >
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

                {directions && <DirectionsRenderer directions={directions} />}
              </GoogleMap>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
