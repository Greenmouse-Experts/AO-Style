import { useSearchParams } from "react-router-dom";

export default function useQueryParams(initialQueryParams) {
  const [searchParams, setSearchParams] = useSearchParams(initialQueryParams);

  const updateQueryParams = (key, value, replacePrevious = true) => {
    setSearchParams(
      (prevParams) => {
        if (typeof key !== "string") {
          const params = { ...Object.fromEntries(prevParams), ...key };

            Object.keys(params).forEach((k) => {
              if (params[k] === null || params[k] === undefined) {
                delete params[k];
              }
            });

            return params;
          } else {
            if (value === null || value === undefined) {
              prevParams.delete(key);
            } else {
              prevParams.set(key, value);
            }
          }

        return prevParams;
      },
      { replace: replacePrevious }
    );
  };

  const clearAllFilters = () => setSearchParams(initialQueryParams);

  return {
    queryParams: Object.fromEntries(searchParams),
    updateQueryParams,
    clearAllFilters,
  };
}
