import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import "./index.css";
import { QueryProvider } from "./services/react-query/queryProvider.jsx";
import "react-toastify/dist/ReactToastify.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ToastContainer } from "react-toastify";
import AppWrapper from "./AppWrapper.jsx";
import { CartProvider } from "./contexts/CartContext.jsx";

if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/firebase-messaging-sw.js")
    .then(() => {})
    .catch(() => {});
}

// Create the router with your existing routes
const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_LOGIN}>
      <QueryProvider>
        <CartProvider>
          <RouterProvider router={router} />
          <AppWrapper />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick={false}
            rtl={false}
            pauseOnFocusLoss
            draggable={false}
            pauseOnHover={false}
            theme="colored"
          />
        </CartProvider>
      </QueryProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
);
