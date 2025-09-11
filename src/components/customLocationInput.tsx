import { usePlacesWidget } from "react-google-autocomplete";

export default function CustomLocationInput({ setFieldValue }: any) {
  function getAddressComponent(components: any, type: any) {
    const component = components.find((c: any) => c.types.includes(type));
    return component?.long_name || "";
  }
  const { ref } = usePlacesWidget({
    apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
    onPlaceSelected: (place) => {
      console.log("Business Address:", place);
      const components = place.address_components;
      const country = getAddressComponent(components, "country");
      const state = getAddressComponent(
        components,
        "administrative_area_level_1",
      );
      const city = getAddressComponent(components, "locality");

      setFieldValue("location", place.formatted_address); // Business location
      setFieldValue("business_country", country); // Separate business country field
      setFieldValue("business_state", state); // Separate business state field
      setFieldValue("business_city", city); // Separate business city field

      // Optional: If you want business coordinates too
      setFieldValue(
        "business_latitude",
        place.geometry?.location?.lat().toString(),
      );
      setFieldValue(
        "business_longitude",
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
      <div className="w-full  relative">
        <label className="block text-gray-600 font-medium mb-4">
          Business Address
        </label>
        <input
          ref={ref}
          placeholder="address here"
          name="address"
          type="text"
          onChange={(e) => {
            setFieldValue("location", e.currentTarget.value);
          }}
          className="w-full p-4 border border-[#CCCCCC] outline-none rounded-lg"
        />
      </div>
    </div>
  );
}
