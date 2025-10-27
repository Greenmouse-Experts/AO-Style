import { useItemMap } from "../../../store/useTempStore";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
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
  const isCustomerInfo = typeof item?.isCustomer === "object" && !!item.isCustomer;
  const customerInfo = isCustomerInfo ? (item?.isCustomer as any) : undefined;

  // For debugging
  console.log("This is the isCustomer node", item?.isCustomer);
  console.log("This is the item for the location processing", item);

  // Determine destination coordinates
  let coordinates;
  if (isCustomerInfo) {
    coordinates = customerInfo?.coordinates;
  } else {
    coordinates = item?.product?.creator?.profile?.coordinates;
  }

  // Parse coordinates for Google Maps
  const destination =
    coordinates &&
    coordinates.latitude &&
    coordinates.longitude &&
    !isNaN(Number(coordinates.latitude)) &&
    !isNaN(Number(coordinates.longitude))
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

  useEffect(() => {
    let watchId: number | null = null;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          toast.error("Enable location services to see directions.");
          console.error(err);
        }
      );
    }
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Defensive center logic, never null for GoogleMap
  const center: google.maps.LatLngLiteral | undefined =
    userLocation ||
    (destination
      ? { lat: destination.lat, lng: destination.lng }
      : undefined);

  if (!item) {
    return (
      <div className="p-4 text-center text-red-500">
        Error: No item found to display map.
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="p-4 text-center text-gray-500">Loading map…</div>;
  }

  if (!destination) {
    return (
      <div className="p-4 text-center text-red-500">
        No valid destination provided.
      </div>
    );
  }

  // Get all info depending on customer/destination
  // Use email instead of name, and use profile picture when available
  // Get pickup email (truncate if too long)
  const pickupEmail = (() => {
    let email: string | undefined;
    if (isCustomerInfo) {
      email = customerInfo?.email;
    } else {
      // There is no .email directly on creator, so we try to fallback to profile?.email if ever available
      email = (item.product.creator as any)?.email; // still fallback, may be undefined
    }
    const safeEmail = email || item?.product?.creator?.name || "No email";
    return safeEmail.length > 22 ? safeEmail.slice(0, 19) + "..." : safeEmail;
  })();
  const profilePicture = isCustomerInfo
    ? customerInfo?.profile_picture // Assuming customerData has no profile picture. Change if schema allows.
    : item.product.creator?.profile?.profile_picture || null;
  const pickupRole = isCustomerInfo
    ? "Customer"
    : item.product.creator?.role?.name;
  const pickupAddress = isCustomerInfo
    ? customerInfo?.address
    : item.product.creator?.profile?.address;
  const pickupPhone = isCustomerInfo
    ? customerInfo?.phone
    : undefined; // tailor phone not available in schema

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
              <div className="label text-xs">ID: {item.id?.replace(/-/g, "").slice(0, 12).toUpperCase()}</div>{" "}
              <span className="badge badge-primary badge-soft outline outline-current/50 ml-auto">
                {item.product.style ? "clothe" : "fabric"}
              </span>
            </div>
            <div className="text-2xl font-bold text-primary my-3">
              {directions?.routes?.[0]?.legs?.[0]?.distance?.text ||
                "Calculating…"}
            </div>
            <div className="my-2">
              <span className="label">
                {isCustomerInfo ? "Delivery Location" : "Pickup Location"}
              </span>
              <div className="text-xs">{pickupAddress}</div>
            </div>
            <div className="divider my-1"></div>
            <section className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {/* Profile picture if available */}
                {profilePicture && (
                  <img
                    src={profilePicture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <div>{pickupEmail}</div>
                  <span className="label">{pickupRole}</span>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                {/* Only show phone if available */}
                {pickupPhone && (
                  <a
                    href={`tel:${pickupPhone}`}
                    className="btn btn-circle btn-clean"
                  >
                    <PhoneIcon size={18} />
                  </a>
                )}
                {/* <button className="btn btn-circle btn-clean">
                  <MessageCircleIcon size={18} />
                </button> */}
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
                    src={item.product.fabric?.photos?.[0]}
                    alt="Fabric"
                  />
                  <img
                    loading="lazy"
                    className="w-full h-32 object-cover rounded-md"
                    src={item.product.fabric?.photos?.[1]}
                    alt="Fabric"
                  />
                </>
              )}
              {item.product.style && (
                <>
                  <img
                    className="w-full h-32 object-cover rounded-md"
                    src={item.product.style?.photos?.[0]}
                    alt="Style"
                  />
                  <img
                    className="w-full h-32 object-cover rounded-md"
                    src={item.product.style?.photos?.[1]}
                    alt="Style"
                  />
                </>
              )}
            </div>
          </section>
        </div>
        <div className="bg-base-200 rounded-xl  flex-1 overflow-hidden">
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={11}
          >
            {/* Only render DirectionsService if directions NOT set and both locations present */}
            {userLocation && destination && !directions && (
              <DirectionsService
                options={{
                  origin: userLocation,
                  destination: destination,
                  travelMode: google.maps.TravelMode.DRIVING,
                }}
                callback={(res, status) => {
                  if (status === "OK" && res && !directions) {
                    setDirections(res);
                  } else if (status !== "OK") {
                    toast.error("Could not calculate directions.");
                    console.error("DirectionsService failed:", status);
                  }
                }}
              />
            )}

            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>
      </div>
    </div>
  );
}
