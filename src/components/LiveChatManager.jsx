import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useCarybinUserStore } from "../store/carybinUserStore";
import { ChatHead } from "./chat";

/**
 * LiveChatManager Component
 * Production-ready chat routing: Internal chat for logged users, Tawk.to for guests
 */
const LiveChatManager = () => {
  const { carybinUser } = useCarybinUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [tawkToStatus, setTawkToStatus] = useState("loading");

  // Check if user is authenticated
  const isAuthenticated = () => {
    const adminToken = Cookies.get("adminToken");
    const userToken = Cookies.get("token");
    return !!(adminToken || userToken || carybinUser);
  };

  // Initialize Tawk.to for guest users
  useEffect(() => {
    const authenticated = isAuthenticated();
    const propertyId =
      import.meta.env.VITE_APP_TAWKTO_PROPERTY_ID ||
      import.meta.env.REACT_APP_TAWKTO_PROPERTY_ID;
    const isEnabled =
      (import.meta.env.VITE_APP_ENABLE_LIVE_CHAT ||
        import.meta.env.REACT_APP_ENABLE_LIVE_CHAT) === "true";

    console.log("LiveChatManager - Auth Status:", authenticated);
    console.log("LiveChatManager - Property ID:", propertyId);
    console.log("LiveChatManager - Enabled:", isEnabled);

    setIsLoading(false);

    // Don't load Tawk.to if user is logged in
    if (authenticated) {
      console.log("User authenticated, using internal chat");
      // Hide Tawk.to if it was previously loaded
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
      return;
    }

    // Check if Tawk.to is enabled and configured
    if (!propertyId || !isEnabled || propertyId === "YOUR_PROPERTY_ID_HERE") {
      console.log(
        "Tawk.to not properly configured - Property ID:",
        propertyId,
        "Enabled:",
        isEnabled,
      );
      setTawkToStatus("not_configured");
      return;
    }

    // Check if Tawk.to script already exists
    if (document.querySelector('script[src*="tawk.to"]')) {
      console.log("Tawk.to script already exists, showing widget");
      setTawkToStatus("loaded");
      if (window.Tawk_API && window.Tawk_API.showWidget) {
        window.Tawk_API.showWidget();
      }
      return;
    }

    console.log("Loading Tawk.to for guest user...");
    setTawkToStatus("loading");

    // Initialize Tawk.to
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    // Set visitor info for better support
    window.Tawk_API.visitor = {
      name: "Guest Visitor",
      email: "",
      platform: "AO-Style Website",
      userType: "guest",
    };

    // Event handlers
    window.Tawk_API.onLoad = function () {
      console.log("✅ Tawk.to widget loaded successfully");
      setTawkToStatus("loaded");
    };

    window.Tawk_API.onStatusChange = function (status) {
      console.log("Tawk.to status changed:", status);
    };

    // Load Tawk.to script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/default`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");

    script.onload = () => {
      console.log("✅ Tawk.to script loaded successfully");
    };

    script.onerror = () => {
      console.error("❌ Failed to load Tawk.to script");
      setTawkToStatus("error");
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Hide widget if user logs in
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }
    };
  }, [carybinUser]);

  // Show loading state briefly
  if (isLoading) {
    return null;
  }

  // For authenticated users, show internal chat
  if (isAuthenticated()) {
    return <ChatHead />;
  }

  // For guests, don't render anything visible - let Tawk.to handle its own display
  // Only show status in development mode
  if (
    process.env.NODE_ENV === "development" &&
    tawkToStatus === "not_configured"
  ) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          background: "#ff6b6b",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "12px",
          zIndex: 9999,
          maxWidth: "300px",
        }}
      >
        <strong>Tawk.to Not Configured</strong>
        <br />
        Please set VITE_APP_TAWKTO_PROPERTY_ID and
        VITE_APP_ENABLE_LIVE_CHAT=true
      </div>
    );
  }

  // In production or when properly configured, render nothing - Tawk.to will show its own widget
  return null;
};

export default LiveChatManager;
