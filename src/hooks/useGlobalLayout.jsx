// useCrossTabLogout.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const useCrossTabLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "logout") {
        console.log(e);
        alert();
        Cookies.remove("token");
        navigate("/login", { replace: true });
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [navigate]);
};

export default useCrossTabLogout;
