import { usePlacesWidget } from "react-google-autocomplete";

export default function AddressInput(props: any) {
  const { ref } = usePlacesWidget({
    apiKey: import.meta?.env.VITE_GOOGLE_MAP_API_KEY,
    onPlaceSelected: (place) => {
      props.setFieldValue("address", place.formatted_address);
      props.setFieldValue(
        "latitude",
        place.geometry?.location?.lat().toString(),
      );
      props.setFieldValue(
        "longitude",
        place.geometry?.location?.lng().toString(),
      );
    },
    options: {
      componentRestrictions: { country: "ng" },
      types: [],
    },
  });
  return (
    <div>
      <input
        type="text"
        ref={ref}
        className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
        placeholder="Enter full detailed address"
        required
        name="address"
        maxLength={150}
        onChange={(e) => {
          props.setFieldValue("address", e.currentTarget.value);
          props.setFieldValue("latitude", "");
          props.setFieldValue("longitude", "");
        }}
        value={props.values.address}
      />
    </div>
  );
}
