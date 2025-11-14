# Logistics Settings State Extraction Fix

## Issue
The logistics dashboard settings page was not extracting and passing the state and country information when users selected an address from the Google Places dropdown. This resulted in empty state values being sent during profile updates.

## Root Cause
The `onPlaceSelected` function in the logistics settings was only extracting:
- `formatted_address`
- `latitude` 
- `longitude`

But was missing the extraction of:
- `state` (from administrative_area_level_1)
- `country` (from country component)

## Solution Implemented

### 1. Enhanced onPlaceSelected Function
Updated the Google Places widget callback to properly extract state and country:

```jsx
const { ref } = usePlacesWidget({
  apiKey: import.meta.env.VITE_GOOGLE_MAP_API_KEY,
  onPlaceSelected: (place) => {
    console.log("🗺️ Logistics - Google Place Selected:", place);
    const lat = place.geometry?.location?.lat();
    const lng = place.geometry?.location?.lng();
    
    // Extract state and country from address components
    let state = "";
    let country = "";
    
    if (place.address_components) {
      place.address_components.forEach((component) => {
        const types = component.types;
        if (types.includes("administrative_area_level_1")) {
          state = component.long_name;
        }
        if (types.includes("country")) {
          country = component.long_name;
        }
      });
    }
    
    // Set all values including state and country
    setFieldValue("address", place.formatted_address);
    setFieldValue("latitude", lat ? lat.toString() : "");
    setFieldValue("longitude", lng ? lng.toString() : "");
    setFieldValue("state", state);
    setFieldValue("country", country);
  },
  // ... options
});
```

### 2. Added Missing Coordinate Fields
Added latitude and longitude to initialValues:

```jsx
const initialValues = {
  name: carybinUser?.name ?? "",
  email: carybinUser?.email ?? "",
  profile_picture: carybinUser?.profile?.profile_picture ?? null,
  address: carybinUser?.profile?.address ?? "",
  country: carybinUser?.profile?.country ?? "",
  state: carybinUser?.profile?.state ?? "",
  phone: carybinUser?.phone ?? "",
  latitude: carybinUser?.profile?.coordinates?.latitude ?? "",
  longitude: carybinUser?.profile?.coordinates?.longitude ?? "",
};
```

### 3. Enhanced Manual Input Handling
When users manually type addresses, clear state and country along with coordinates:

```jsx
onChange={(e) => {
  setFieldValue("address", e.currentTarget.value);
  setFieldValue("latitude", "");
  setFieldValue("longitude", "");
  setFieldValue("state", "");
  setFieldValue("country", "");
}}
```

### 4. Added Coordinates Display
Added visual feedback showing coordinates when available:

```jsx
{(values.latitude || values.longitude) && (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
    <div>
      <label className="block text-gray-700 mb-2 text-sm font-medium">
        Latitude
      </label>
      <div className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-600 overflow-hidden">
        <span className="break-all">{values.latitude || "Not set"}</span>
      </div>
    </div>
    <div>
      <label className="block text-gray-700 mb-2 text-sm font-medium">
        Longitude
      </label>
      <div className="w-full p-3 bg-white border border-blue-200 rounded-lg text-sm text-gray-600 overflow-hidden">
        <span className="break-all">{values.longitude || "Not set"}</span>
      </div>
    </div>
    <div className="col-span-1 lg:col-span-2">
      <p className="text-xs text-blue-600">
        📍 These coordinates are automatically set when you select an address using Google Places autocomplete above.
      </p>
    </div>
  </div>
)}
```

### 5. Enhanced Logging
Added comprehensive logging for debugging:

```jsx
onSubmit: (val) => {
  console.log("🚚 Logistics Settings - Form submission data:", val);
  console.log("🌍 Logistics Settings - State and Country being sent:", {
    state: val.state,
    country: val.country,
    address: val.address,
    coordinates: {
      latitude: val.latitude,
      longitude: val.longitude,
    },
  });
  // ... rest of submission logic
}
```

## Files Modified
- `src/modules/Pages/logisticsDashboard/Settings.jsx`

## Testing Instructions

### Manual Testing
1. Go to Logistics Dashboard → Settings
2. Navigate to Profile section
3. Start typing an address in the address field
4. Select an address from Google's dropdown suggestions
5. Check console logs to verify state and country extraction
6. Submit the form
7. Verify that state and country are included in the API request

### Expected Behavior
- **Before Fix**: State field would be empty in form submission
- **After Fix**: State field contains the extracted state name from Google Places
- **Visual Feedback**: Coordinates display section appears when address is selected
- **Console Logs**: Clear logging shows extraction and submission of location data

## Benefits
1. **Complete Location Data**: Now captures full address details including state
2. **Consistent with Other Pages**: Matches the pattern used in other settings pages
3. **Better User Experience**: Visual feedback shows when coordinates are set
4. **Debugging Support**: Enhanced logging for troubleshooting
5. **Data Integrity**: Ensures accurate delivery and location information

## Related Components
This fix aligns the logistics settings with the same pattern used in:
- Customer Dashboard Settings
- Admin Dashboard Settings  
- Fabric Dashboard Settings
- Sales Dashboard Settings
- Tailor Dashboard Settings

All settings pages now consistently extract and pass complete location data from Google Places selections.