import React, { useEffect } from "react";
import Cookies from "js-cookie";
import { useCarybinUserStore } from "../store/carybinUserStore";
import { ChatHead } from "./chat";

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

    (function () {
      var s1 = document.createElement("script");
      var s0 = document.getElementsByTagName("script")[0];
      s1.async = true;
      s1.src = "https://embed.tawk.to/68d194dd9b9e81192aab22b3/1j5par15d";
      s1.charset = "UTF-8";
      s1.setAttribute("crossorigin", "*");

      s1.onload = () => {
        console.log("✅ Tawk.to script loaded successfully");
      };

      s1.onerror = () => {
        console.error("❌ Failed to load Tawk.to script");
      };

      s0.parentNode.insertBefore(s1, s0);
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

// <!--Start of Tawk.to Script-->
// <script type="text/javascript">
// var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
// (function(){
// var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
// s1.async=true;
// s1.src='https://embed.tawk.to/68d194dd9b9e81192aab22b3/1j5par15d';
// s1.charset='UTF-8';
// s1.setAttribute('crossorigin','*');
// s0.parentNode.insertBefore(s1,s0);
// })();
// </script>
// <!--End of Tawk.to Script-->
