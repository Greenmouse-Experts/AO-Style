importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');


const firebaseConfig = {
  apiKey: "AIzaSyCLutEIgOiAnoMRdAKbu7tRh49N4ULcYMg",
  authDomain: "carybin-c89a7.firebaseapp.com",
  projectId: "carybin-c89a7",
  storageBucket: "carybin-c89a7.firebasestorage.app",
  messagingSenderId: "331646577121",
  appId: "1:331646577121:web:9ccc1581bfcd4b53948aa0",
  measurementId: "G-07SMS9TQWT",
  vapidKey:
    "BFns3QSMy3RE6PjeD7i4yhl63Y_x2VPPoEKTXhd58zfsU4lABY9nQysUHFWAIYhe04XUfLOHqM8U_dsnyYN30vk",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function (payload) {
  console.log("[firebase-messaging-sw.js] Received background message:", payload);

  const notificationTitle = payload.notification?.title || "New Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon:
      payload.notification?.image ||
      "https://res.cloudinary.com/greenmouse-tech/image/upload/v1742964300/AoStyle/CARYBIN_TRANSPARENT_1_ujbdei.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: handle notification click
self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow("/") // or deep link to a specific route
  );
});
