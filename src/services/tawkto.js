/**
 * Tawk.to Live Chat Service
 * Professional live chat integration for non-authenticated users
 */

class TawkToService {
  constructor() {
    this.isInitialized = false;
    this.isVisible = false;
    this.config = {
      // Replace with your actual Tawk.to Property ID
      propertyId:
        import.meta.env.VITE_APP_TAWKTO_PROPERTY_ID || "YOUR_PROPERTY_ID_HERE",
      // Optional: Replace with your widget ID for specific customization
      widgetId: import.meta.env.VITE_APP_TAWKTO_WIDGET_ID || "default",
      // Tawk.to script source
      scriptSrc: "https://embed.tawk.to",
    };

    // Bind methods to preserve context
    this.initialize = this.initialize.bind(this);
    this.show = this.show.bind(this);
    this.hide = this.hide.bind(this);
    this.toggle = this.toggle.bind(this);
    this.setVisitorInfo = this.setVisitorInfo.bind(this);
    this.onLoad = this.onLoad.bind(this);
    this.onStatusChange = this.onStatusChange.bind(this);
    this.onChatMaximized = this.onChatMaximized.bind(this);
    this.onChatMinimized = this.onChatMinimized.bind(this);
    this.onChatHidden = this.onChatHidden.bind(this);
    this.onChatStarted = this.onChatStarted.bind(this);
    this.onChatEnded = this.onChatEnded.bind(this);
    this.onPrechatSubmit = this.onPrechatSubmit.bind(this);
    this.onOfflineSubmit = this.onOfflineSubmit.bind(this);
  }

  /**
   * Initialize Tawk.to widget
   * @param {Object} options - Configuration options
   * @returns {Promise} - Initialization promise
   */
  initialize(options = {}) {
    return new Promise((resolve, reject) => {
      try {
        // Prevent multiple initializations
        if (this.isInitialized) {
          console.log("🟡 Tawk.to: Already initialized");
          resolve();
          return;
        }

        // Validate property ID
        if (
          !this.config.propertyId ||
          this.config.propertyId === "YOUR_PROPERTY_ID_HERE" ||
          this.config.propertyId === "not set"
        ) {
          console.error(
            "❌ Tawk.to: Property ID not configured:",
            this.config.propertyId,
          );
          reject(new Error("Tawk.to Property ID not configured"));
          return;
        }

        console.log("🚀 Tawk.to: Initializing live chat...");

        // Create Tawk_API object if it doesn't exist
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Set up event listeners
        this.setupEventListeners();

        // Apply custom configuration
        this.applyConfiguration(options);

        // Load the Tawk.to script
        this.loadScript()
          .then(() => {
            this.isInitialized = true;
            console.log("✅ Tawk.to: Successfully initialized");
            resolve();
          })
          .catch((error) => {
            console.error("❌ Tawk.to: Failed to load script", error);
            reject(error);
          });
      } catch (error) {
        console.error("❌ Tawk.to: Initialization error", error);
        reject(error);
      }
    });
  }

  /**
   * Load Tawk.to script dynamically
   * @returns {Promise}
   */
  loadScript() {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(`script[src*="tawk.to"]`);
      if (existingScript) {
        console.log("📦 Tawk.to: Script already loaded");
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = `${this.config.scriptSrc}/${this.config.propertyId}/${this.config.widgetId}`;
      script.charset = "UTF-8";
      script.setAttribute("crossorigin", "*");

      // Add timeout for script loading
      const timeout = setTimeout(() => {
        console.error("📦 Tawk.to: Script loading timeout");
        reject(new Error("Script loading timeout"));
      }, 15000); // 15 seconds timeout

      script.onload = () => {
        clearTimeout(timeout);
        console.log("📦 Tawk.to: Script loaded successfully");
        // Add small delay to ensure Tawk_API is ready
        setTimeout(() => resolve(), 500);
      };

      script.onerror = (error) => {
        clearTimeout(timeout);
        console.error("📦 Tawk.to: Script loading failed", error);
        reject(error);
      };

      try {
        document.head.appendChild(script);
      } catch (error) {
        clearTimeout(timeout);
        console.error("📦 Tawk.to: Failed to append script", error);
        reject(error);
      }
    });
  }

  /**
   * Setup event listeners for Tawk.to events
   */
  setupEventListeners() {
    window.Tawk_API.onLoad = this.onLoad;
    window.Tawk_API.onStatusChange = this.onStatusChange;
    window.Tawk_API.onChatMaximized = this.onChatMaximized;
    window.Tawk_API.onChatMinimized = this.onChatMinimized;
    window.Tawk_API.onChatHidden = this.onChatHidden;
    window.Tawk_API.onChatStarted = this.onChatStarted;
    window.Tawk_API.onChatEnded = this.onChatEnded;
    window.Tawk_API.onPrechatSubmit = this.onPrechatSubmit;
    window.Tawk_API.onOfflineSubmit = this.onOfflineSubmit;
  }

  /**
   * Apply custom configuration options
   * @param {Object} options - Configuration options
   */
  applyConfiguration(options) {
    const {
      hideWidget = false,
      customStyle = {},
      visitorInfo = {},
      secure = true,
    } = options;

    // Hide widget initially if specified
    if (hideWidget) {
      window.Tawk_API.hideWidget = true;
    }

    // Apply custom styling
    if (Object.keys(customStyle).length > 0) {
      window.Tawk_API.customStyle = customStyle;
    }

    // Set visitor information
    if (Object.keys(visitorInfo).length > 0) {
      this.setVisitorInfo(visitorInfo);
    }

    // Enable secure mode
    if (secure) {
      window.Tawk_API.secure = true;
    }
  }

  /**
   * Show the Tawk.to widget
   */
  show() {
    if (!this.isInitialized) {
      console.warn("⚠️ Tawk.to: Cannot show widget - not initialized");
      return;
    }

    try {
      if (window.Tawk_API && typeof window.Tawk_API.showWidget === "function") {
        window.Tawk_API.showWidget();
        this.isVisible = true;
        console.log("👁️ Tawk.to: Widget shown");
      } else {
        console.warn("⚠️ Tawk.to: showWidget function not available");
      }
    } catch (error) {
      console.error("❌ Tawk.to: Failed to show widget", error);
    }
  }

  /**
   * Hide the Tawk.to widget
   */
  hide() {
    if (!this.isInitialized) {
      console.warn("⚠️ Tawk.to: Cannot hide widget - not initialized");
      return;
    }

    try {
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === "function") {
        window.Tawk_API.hideWidget();
        this.isVisible = false;
        console.log("🙈 Tawk.to: Widget hidden");
      } else {
        console.warn("⚠️ Tawk.to: hideWidget function not available");
      }
    } catch (error) {
      console.error("❌ Tawk.to: Failed to hide widget", error);
    }
  }

  /**
   * Toggle widget visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Set visitor information
   * @param {Object} visitorInfo - Visitor information object
   */
  setVisitorInfo(visitorInfo) {
    try {
      const { name, email, hash, userId, ...customAttributes } = visitorInfo;

      window.Tawk_API.visitor = {
        name: name || "Anonymous Visitor",
        email: email || "",
        hash: hash || "",
        userId: userId || "",
        ...customAttributes,
      };

      console.log("👤 Tawk.to: Visitor info set", visitorInfo);
    } catch (error) {
      console.error("❌ Tawk.to: Failed to set visitor info", error);
    }
  }

  /**
   * Send custom event to Tawk.to
   * @param {string} eventName - Event name
   * @param {Object} data - Event data
   */
  sendEvent(eventName, data = {}) {
    try {
      if (!this.isInitialized) {
        console.warn("⚠️ Tawk.to: Cannot send event - not initialized");
        return;
      }

      window.Tawk_API.addEvent(eventName, data);
      console.log(`📤 Tawk.to: Event sent - ${eventName}`, data);
    } catch (error) {
      console.error("❌ Tawk.to: Failed to send event", error);
    }
  }

  /**
   * Add custom tags to the conversation
   * @param {Array<string>} tags - Array of tags
   */
  addTags(tags) {
    try {
      if (!this.isInitialized || !Array.isArray(tags)) {
        console.warn(
          "⚠️ Tawk.to: Cannot add tags - not initialized or invalid tags",
        );
        return;
      }

      tags.forEach((tag) => {
        window.Tawk_API.addTag(tag);
      });

      console.log("🏷️ Tawk.to: Tags added", tags);
    } catch (error) {
      console.error("❌ Tawk.to: Failed to add tags", error);
    }
  }

  /**
   * Remove custom tags from the conversation
   * @param {Array<string>} tags - Array of tags to remove
   */
  removeTags(tags) {
    try {
      if (!this.isInitialized || !Array.isArray(tags)) {
        console.warn(
          "⚠️ Tawk.to: Cannot remove tags - not initialized or invalid tags",
        );
        return;
      }

      tags.forEach((tag) => {
        window.Tawk_API.removeTag(tag);
      });

      console.log("🏷️ Tawk.to: Tags removed", tags);
    } catch (error) {
      console.error("❌ Tawk.to: Failed to remove tags", error);
    }
  }

  /**
   * Get current widget status
   * @returns {string} - Widget status
   */
  getStatus() {
    try {
      if (!this.isInitialized) {
        return "not_initialized";
      }
      if (window.Tawk_API && typeof window.Tawk_API.getStatus === "function") {
        return window.Tawk_API.getStatus();
      }
      return "loading";
    } catch (error) {
      console.error("❌ Tawk.to: Failed to get status", error);
      return "error";
    }
  }

  /**
   * Check if widget is visible
   * @returns {boolean}
   */
  isWidgetVisible() {
    return this.isVisible;
  }

  /**
   * Destroy the widget and clean up
   */
  destroy() {
    try {
      if (window.Tawk_API && window.Tawk_API.hideWidget) {
        window.Tawk_API.hideWidget();
      }

      // Remove script
      const script = document.querySelector(`script[src*="tawk.to"]`);
      if (script) {
        script.remove();
      }

      // Clean up global variables
      delete window.Tawk_API;
      delete window.Tawk_LoadStart;

      this.isInitialized = false;
      this.isVisible = false;

      console.log("🧹 Tawk.to: Widget destroyed and cleaned up");
    } catch (error) {
      console.error("❌ Tawk.to: Failed to destroy widget", error);
    }
  }

  // Event handlers
  onLoad() {
    console.log("🎉 Tawk.to: Widget loaded successfully");
    try {
      this.isVisible = !window.Tawk_API.hideWidget;
      // Force hide widget initially so we can control visibility
      if (window.Tawk_API && typeof window.Tawk_API.hideWidget === "function") {
        window.Tawk_API.hideWidget();
        this.isVisible = false;
      }
    } catch (error) {
      console.warn("⚠️ Tawk.to: Error in onLoad", error);
    }
  }

  onStatusChange(status) {
    console.log("📊 Tawk.to: Status changed to", status);

    // Customize behavior based on status
    switch (status) {
      case "online":
        console.log("🟢 Tawk.to: Agents are online");
        break;
      case "away":
        console.log("🟡 Tawk.to: Agents are away");
        break;
      case "offline":
        console.log("🔴 Tawk.to: Agents are offline");
        break;
      default:
        console.log("⚪ Tawk.to: Unknown status");
    }
  }

  onChatMaximized() {
    console.log("📈 Tawk.to: Chat maximized");
    this.sendEvent("chat_maximized", { timestamp: new Date().toISOString() });
  }

  onChatMinimized() {
    console.log("📉 Tawk.to: Chat minimized");
    this.sendEvent("chat_minimized", { timestamp: new Date().toISOString() });
  }

  onChatHidden() {
    console.log("👻 Tawk.to: Chat hidden");
    this.isVisible = false;
  }

  onChatStarted() {
    console.log("🚀 Tawk.to: Chat started");
    this.sendEvent("chat_started", {
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    });
  }

  onChatEnded() {
    console.log("🏁 Tawk.to: Chat ended");
    this.sendEvent("chat_ended", {
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
    });
  }

  onPrechatSubmit(data) {
    console.log("📝 Tawk.to: Pre-chat form submitted", data);
    this.sendEvent("prechat_submitted", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }

  onOfflineSubmit(data) {
    console.log("📧 Tawk.to: Offline form submitted", data);
    this.sendEvent("offline_form_submitted", {
      ...data,
      timestamp: new Date().toISOString(),
    });
  }
}

// Create singleton instance
const tawkToService = new TawkToService();

// Export service instance and class
export default tawkToService;
export { TawkToService };

// Additional utility functions
export const tawkToUtils = {
  /**
   * Check if user is in a supported browser
   * @returns {boolean}
   */
  isSupportedBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    const unsupportedBrowsers = ["ie", "internet explorer"];

    return !unsupportedBrowsers.some((browser) => userAgent.includes(browser));
  },

  /**
   * Get user's location info for better support
   * @returns {Promise<Object>}
   */
  async getUserLocationInfo() {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      return {
        country: data.country_name,
        city: data.city,
        timezone: data.timezone,
        ip: data.ip,
      };
    } catch (error) {
      console.warn("⚠️ Tawk.to: Could not get location info", error);
      return {};
    }
  },

  /**
   * Detect user's device type
   * @returns {string}
   */
  getDeviceType() {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      return "tablet";
    }
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/.test(
        userAgent,
      )
    ) {
      return "mobile";
    }
    return "desktop";
  },

  /**
   * Get page-specific context for better support
   * @returns {Object}
   */
  getPageContext() {
    return {
      url: window.location.href,
      path: window.location.pathname,
      referrer: document.referrer,
      title: document.title,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      timestamp: new Date().toISOString(),
    };
  },
};
