import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes";
import { useQueryClient } from "@tanstack/react-query";
import {
  messaging,
  requestNotificationPermission,
} from "./notifications/firebase.js";
import { onMessage } from "firebase/messaging";
import { useEffect } from "react";
import useToast from "./hooks/useToast.jsx";

const App = () => {
  const { toastError, toastSuccess, toastInfo, toastWarning } = useToast();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (
      typeof Notification === "undefined" ||
      !("serviceWorker" in navigator)
    ) {
      return;
    }
    requestNotificationPermission();

    onMessage(messaging, (payload) => {
      toastSuccess(payload?.notification?.body);

      new Notification(payload.notification?.title || "New Notification", {
        body: payload.notification?.body || "",
        icon:
          payload.notification?.image ||
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png",
      });
      queryClient.invalidateQueries({
        queryKey: ["get-notification"],
      });
    });
  }, []);

  return (
    <Router>
      <Routes>
        {routes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </Router>
  );
};

export default App;
