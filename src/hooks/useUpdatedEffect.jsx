import { useRef, useEffect } from "react";

export default function useUpdatedEffect(effect, dependencies) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      effect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}
