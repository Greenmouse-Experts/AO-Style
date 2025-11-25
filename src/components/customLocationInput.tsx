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
      const stateRaw = getAddressComponent(
        components,
        "administrative_area_level_1",
      );
      const city = getAddressComponent(components, "locality");

      // Normalize state to match nigeriaStates format
      // Nigeria states dropdown uses format like "Lagos State", "Abia State", etc.
      // Google Places returns "Lagos", "Abia", etc.
      let state = stateRaw;
      if (stateRaw) {
        const stateLower = stateRaw.toLowerCase().trim();
        
        // Handle FCT (Federal Capital Territory)
        if (stateLower.includes("fct") || stateLower.includes("federal capital territory") || stateLower.includes("federal capital")) {
          state = "FCT";
        } else if (!stateLower.includes("state")) {
          // Add "State" suffix to match the dropdown format
          // Capitalize first letter of each word
          const stateFormatted = stateRaw
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
          state = `${stateFormatted} State`;
        } else {
          // Already has "State", just ensure proper capitalization
          state = stateRaw
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(" ");
        }
      }

      console.log("📍 Extracted state:", { stateRaw, normalized: state });

      setFieldValue("location", place.formatted_address); // Business location
      setFieldValue("business_country", country); // Separate business country field
      setFieldValue("business_state", stateRaw); // Keep raw state for business_state
      setFieldValue("business_city", city); // Separate business city field
      // Also set country and state for the form fields (use normalized state)
      setFieldValue("country", country);
      setFieldValue("state", state);

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
