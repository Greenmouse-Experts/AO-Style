import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useCarybinUserStore } from "../store/carybinUserStore";
import { ChatHead } from "./chat";
import tawkToService from "../services/tawkto";

/**
 * LiveChatManager Component
 * Simple and reliable chat routing: Internal chat for logged users, Tawk.to for guests
 */
const LiveChatManager = () => {
  const { carybinUser } = useCarybinUserStore();

  // Check if user is authenticated
  const isAuthenticated = () => {
    const adminToken = Cookies.get("adminToken");
    const userToken = Cookies.get("token");
    return !!(adminToken || userToken || carybinUser);
  };

  // Initialize Tawk.to for guest users
  useEffect(() => {
    const authenticated = isAuthenticated();

    console.log("LiveChatManager - User authenticated:", authenticated);

    // Don't load Tawk.to if user is logged in
    if (authenticated) {
      console.log("User authenticated, hiding Tawk.to and using internal chat");
      // Hide Tawk.to if it was previously loaded
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
      return;
    }

    // Check if Tawk.to script already exists
    if (document.querySelector('script[src*="embed.tawk.to"]')) {
      console.log("Tawk.to script already exists, showing widget");
      if (window.Tawk_API && window.Tawk_API.showWidget) {
        window.Tawk_API.showWidget();
      }
      return;
    }

    console.log("Loading Tawk.to for guest user...");

    // Load Tawk.to script directly
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Initialize Tawk.to via the centralized TawkToService using environment configuration
    (async function () {
      const propertyId = import.meta.env.VITE_APP_TAWKTO_PROPERTY_ID;
      const widgetId = import.meta.env.VITE_APP_TAWKTO_WIDGET_ID || "default";

      if (!propertyId) {
        console.error("❌ Tawk.to: VITE_APP_TAWKTO_PROPERTY_ID is not set");
        return;
      }

      try {
        await tawkToService.initialize({
          propertyId,
          widgetId,
          hideWidget: false,
        });
        console.log("✅ Tawk.to: Initialized via tawkToService");
        // Ensure widget is visible for guests
        tawkToService.show();
      } catch (err) {
        console.error(
          "❌ Tawk.to: Failed to initialize via tawkToService",
          err,
        );
      }
    })();

    // Cleanup function
    return () => {
      // Hide widget if user logs in
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, [carybinUser]);

  // For authenticated users, show internal chat
  if (isAuthenticated()) {
    return <ChatHead />;
  }

  // For guests, don't render anything visible - Tawk.to will show its own widget
  return null;
};

export default LiveChatManager;
