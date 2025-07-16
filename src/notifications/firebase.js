import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import Cookies from "js-cookie";

const firebaseConfig = {
  apiKey: "AIzaSyCLutEIgOiAnoMRdAKbu7tRh49N4ULcYMg",
  authDomain: "carybin-c89a7.firebaseapp.com",
  projectId: "carybin-c89a7",
  storageBucket: "carybin-c89a7.firebasestorage.app",
  messagingSenderId: "331646577121",
  appId: "1:331646577121:web:9ccc1581bfcd4b53948aa0",
  measurementId: "G-07SMS9TQWT",
  vapidKey:
    "BIACB3hPnQHNWO7LTdfemJpTu3ZEQokeATwiZo99LXFRgAxDY4BYVsGlu_tTbCRUkORwqHtD-bEZPNFPV0_LZSE",
};
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  const accessToken = Cookies.get("token");
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );
      const token = await getToken(messaging, {
        vapidKey:
          "BIACB3hPnQHNWO7LTdfemJpTu3ZEQokeATwiZo99LXFRgAxDY4BYVsGlu_tTbCRUkORwqHtD-bEZPNFPV0_LZSE",
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log("FCM Token:", token);
        localStorage.setItem("fmc_token", token);
        await fetch(
          `${import.meta.env.VITE_APP_CaryBin_API_URL}/notification-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}` || "",
            },
            body: JSON.stringify({ token: token, device_type: "web" }),
          }
        );
      }
    } else {
      console.log("Notification permission denied");
    }
  } catch (error) {
    console.error("Error getting token", error);
  }
};

export { messaging, getToken, onMessage };
