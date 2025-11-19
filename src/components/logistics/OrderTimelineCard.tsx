import React from "react";
import {
  Clock,
  Package,
  Truck,
  CheckCircle,
  User,
  Calendar,
  MapPin,
} from "lucide-react";

interface OrderTimelineProps {
  dispatched_to_agent_at?: string | null;
  delivered_to_tailor_at?: string | null;
  delivered_at?: string | null;
  in_transit_at?: string | null;
  out_for_delivery_at?: string | null;
  created_at?: string | null;
  status?: string;
  first_leg_logistics_agent_id?: string | null;
  logistics_agent_id?: string | null;
}

interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp?: string | null;
  icon: React.ReactNode;
  status: "completed" | "current" | "pending";
  color: string;
}

const OrderTimelineCard: React.FC<OrderTimelineProps> = ({
  dispatched_to_agent_at,
  delivered_to_tailor_at,
  delivered_at,
  in_transit_at,
  out_for_delivery_at,
  created_at,
  status = "",
  first_leg_logistics_agent_id,
  logistics_agent_id,
}) => {
  const formatDateTime = (timestamp: string | null | undefined) => {
    if (!timestamp) return null;

    try {
      const date = new Date(timestamp);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return { date: formattedDate, time: formattedTime };
    } catch {
      return null;
    }
  };

  const currentStatus = status?.toUpperCase();

  const getEventStatus = (
    eventTimestamp: string | null | undefined,
    eventType: string,
  ): "completed" | "current" | "pending" => {
    if (eventTimestamp) return "completed";

    // Determine if this is the current step based on order status
    switch (eventType) {
      case "DISPATCHED_TO_AGENT":
        return currentStatus === "DISPATCHED_TO_AGENT" ? "current" : "pending";
      case "IN_TRANSIT":
        return currentStatus === "IN_TRANSIT" ? "current" : "pending";
      case "OUT_FOR_DELIVERY":
        return currentStatus === "OUT_FOR_DELIVERY" ? "current" : "pending";
      case "DELIVERED_TO_TAILOR":
        return currentStatus === "DELIVERED_TO_TAILOR" ? "current" : "pending";
      case "DELIVERED":
        return currentStatus === "DELIVERED" ? "current" : "pending";
      default:
        return "pending";
    }
  };

  // Determine if we should show legs based on logistics agent data
  const shouldShowLegs = first_leg_logistics_agent_id || logistics_agent_id;

  // First Leg Events
  const firstLegEvents: TimelineEvent[] = [
    {
      id: "created",
      title: "Order Created",
      description: "Order has been placed successfully",
      timestamp: created_at,
      icon: <Package className="w-4 h-4" />,
      status: created_at ? "completed" : "pending",
      color: "text-green-600 bg-green-100",
    },
    {
      id: "dispatched",
      title: "Dispatched to Agent",
      description: "Order assigned to first leg logistics agent",
      timestamp: dispatched_to_agent_at,
      icon: <User className="w-4 h-4" />,
      status: getEventStatus(dispatched_to_agent_at, "DISPATCHED_TO_AGENT"),
      color: "text-blue-600 bg-blue-100",
    },
  ];

  // Add delivered to tailor if it exists (end of first leg)
  if (delivered_to_tailor_at) {
    firstLegEvents.push({
      id: "delivered_to_tailor",
      title: "Delivered to Tailor",
      description: "Package delivered to tailor (First leg completed)",
      timestamp: delivered_to_tailor_at,
      icon: <CheckCircle className="w-4 h-4" />,
      status: "completed",
      color: "text-purple-600 bg-purple-100",
    });
  }

  // Second Leg Events
  const secondLegEvents: TimelineEvent[] = [
    {
      id: "in_transit",
      title: "In Transit from Tailor",
      description: "Package picked up from tailor and in transit",
      timestamp: in_transit_at,
      icon: <Truck className="w-4 h-4" />,
      status: getEventStatus(in_transit_at, "IN_TRANSIT"),
      color: "text-orange-600 bg-orange-100",
    },
    {
      id: "out_for_delivery",
      title: "Out for Delivery",
      description: "Package is out for final delivery",
      timestamp: out_for_delivery_at,
      icon: <Truck className="w-4 h-4" />,
      status: getEventStatus(out_for_delivery_at, "OUT_FOR_DELIVERY"),
      color: "text-yellow-600 bg-yellow-100",
    },
  ];

  // Add final delivery if it exists
  if (delivered_at) {
    secondLegEvents.push({
      id: "delivered",
      title: "Delivered",
      description: "Package successfully delivered to customer",
      timestamp: delivered_at,
      icon: <CheckCircle className="w-4 h-4" />,
      status: "completed",
      color: "text-green-600 bg-green-100",
    });
  }

  // Fallback to single timeline if no leg data
  const singleTimelineEvents: TimelineEvent[] = [
    {
      id: "created",
      title: "Order Created",
      description: "Order has been placed successfully",
      timestamp: created_at,
      icon: <Package className="w-4 h-4" />,
      status: created_at ? "completed" : "pending",
      color: "text-green-600 bg-green-100",
    },
    {
      id: "dispatched",
      title: "Dispatched to Agent",
      description: "Order assigned to logistics agent",
      timestamp: dispatched_to_agent_at,
      icon: <User className="w-4 h-4" />,
      status: getEventStatus(dispatched_to_agent_at, "DISPATCHED_TO_AGENT"),
      color: "text-blue-600 bg-blue-100",
    },
    {
      id: "in_transit",
      title: "In Transit",
      description: "Package is on the way",
      timestamp: in_transit_at,
      icon: <Truck className="w-4 h-4" />,
      status: getEventStatus(in_transit_at, "IN_TRANSIT"),
      color: "text-orange-600 bg-orange-100",
    },
    {
      id: "out_for_delivery",
      title: "Out for Delivery",
      description: "Package is out for delivery",
      timestamp: out_for_delivery_at,
      icon: <Truck className="w-4 h-4" />,
      status: getEventStatus(out_for_delivery_at, "OUT_FOR_DELIVERY"),
      color: "text-yellow-600 bg-yellow-100",
    },
  ];

  // Add conditional events for single timeline
  if (delivered_to_tailor_at) {
    singleTimelineEvents.push({
      id: "delivered_to_tailor",
      title: "Delivered to Tailor",
      description: "Package delivered to tailor",
      timestamp: delivered_to_tailor_at,
      icon: <CheckCircle className="w-4 h-4" />,
      status: "completed",
      color: "text-purple-600 bg-purple-100",
    });
  }

  if (delivered_at) {
    singleTimelineEvents.push({
      id: "delivered",
      title: "Delivered",
      description: "Package successfully delivered",
      timestamp: delivered_at,
      icon: <CheckCircle className="w-4 h-4" />,
      status: "completed",
      color: "text-green-600 bg-green-100",
    });
  }

  // Filter events for visibility
  const visibleFirstLegEvents = firstLegEvents.filter(
    (event) =>
      event.timestamp ||
      event.status === "current" ||
      event.status === "completed",
  );

  const visibleSecondLegEvents = secondLegEvents.filter(
    (event) =>
      event.timestamp ||
      event.status === "current" ||
      event.status === "completed",
  );

  const visibleSingleEvents = singleTimelineEvents.filter(
    (event) =>
      event.timestamp ||
      event.status === "current" ||
      event.status === "completed",
  );

  if (!shouldShowLegs && visibleSingleEvents.length === 0) {
    return null;
  }

  if (
    shouldShowLegs &&
    visibleFirstLegEvents.length === 0 &&
    visibleSecondLegEvents.length === 0
  ) {
    return null;
  }

  const renderTimelineSection = (
    events: TimelineEvent[],
    title: string,
    icon: React.ReactNode,
  ) => (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h4 className="text-md font-medium text-gray-800">{title}</h4>
      </div>

      <div className="space-y-4 ml-2">
        {events.map((event, index) => {
          const dateTime = formatDateTime(event.timestamp);
          const isLast = index === events.length - 1;

          return (
            <div key={event.id} className="relative">
              {/* Timeline line */}
              {!isLast && (
                <div
                  className={`absolute left-6 top-12 w-0.5 h-8 ${
                    event.status === "completed" ? "bg-gray-300" : "bg-gray-200"
                  }`}
                />
              )}

              <div className="flex items-start gap-4">
                {/* Timeline icon */}
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0
                    ${
                      event.status === "completed"
                        ? `${event.color} border-transparent`
                        : event.status === "current"
                          ? "bg-purple-100 text-purple-600 border-purple-300 ring-4 ring-purple-100"
                          : "bg-gray-100 text-gray-400 border-gray-200"
                    }
                  `}
                >
                  {event.icon}
                </div>

                {/* Timeline content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4
                        className={`font-medium ${
                          event.status === "completed"
                            ? "text-gray-900"
                            : event.status === "current"
                              ? "text-purple-900"
                              : "text-gray-500"
                        }`}
                      >
                        {event.title}
                      </h4>
                      <p
                        className={`text-sm mt-1 ${
                          event.status === "completed" ||
                          event.status === "current"
                            ? "text-gray-600"
                            : "text-gray-400"
                        }`}
                      >
                        {event.description}
                      </p>
                    </div>

                    {/* Timestamp */}
                    {dateTime && (
                      <div className="text-right flex-shrink-0 ml-4">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          <span>{dateTime.date}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {dateTime.time}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Status indicator for current step */}
                  {event.status === "current" && !event.timestamp && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Current Status
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Order Timeline</h3>
      </div>

      {shouldShowLegs ? (
        <div>
          {/* First Leg */}
          {visibleFirstLegEvents.length > 0 &&
            renderTimelineSection(
              visibleFirstLegEvents,
              "First Leg - To Tailor",
              <MapPin className="w-4 h-4 text-blue-600" />,
            )}

          {/* Divider between legs */}
          {visibleFirstLegEvents.length > 0 &&
            visibleSecondLegEvents.length > 0 && (
              <div className="my-6 border-t border-gray-200 pt-2">
                <div className="flex items-center justify-center">
                  <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">
                    Handover Complete
                  </span>
                </div>
              </div>
            )}

          {/* Second Leg */}
          {visibleSecondLegEvents.length > 0 &&
            renderTimelineSection(
              visibleSecondLegEvents,
              "Second Leg - To Customer",
              <MapPin className="w-4 h-4 text-orange-600" />,
            )}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleSingleEvents.map((event, index) => {
            const dateTime = formatDateTime(event.timestamp);
            const isLast = index === visibleSingleEvents.length - 1;

            return (
              <div key={event.id} className="relative">
                {/* Timeline line */}
                {!isLast && (
                  <div
                    className={`absolute left-6 top-12 w-0.5 h-8 ${
                      event.status === "completed"
                        ? "bg-gray-300"
                        : "bg-gray-200"
                    }`}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Timeline icon */}
                  <div
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 flex-shrink-0
                      ${
                        event.status === "completed"
                          ? `${event.color} border-transparent`
                          : event.status === "current"
                            ? "bg-purple-100 text-purple-600 border-purple-300 ring-4 ring-purple-100"
                            : "bg-gray-100 text-gray-400 border-gray-200"
                      }
                    `}
                  >
                    {event.icon}
                  </div>

                  {/* Timeline content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4
                          className={`font-medium ${
                            event.status === "completed"
                              ? "text-gray-900"
                              : event.status === "current"
                                ? "text-purple-900"
                                : "text-gray-500"
                          }`}
                        >
                          {event.title}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            event.status === "completed" ||
                            event.status === "current"
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {event.description}
                        </p>
                      </div>

                      {/* Timestamp */}
                      {dateTime && (
                        <div className="text-right flex-shrink-0 ml-4">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            <span>{dateTime.date}</span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {dateTime.time}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Status indicator for current step */}
                    {event.status === "current" && !event.timestamp && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Current Status
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary footer */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            {shouldShowLegs
              ? `${visibleFirstLegEvents.filter((e) => e.status === "completed").length + visibleSecondLegEvents.filter((e) => e.status === "completed").length} of ${firstLegEvents.length + secondLegEvents.length} steps completed`
              : `${visibleSingleEvents.filter((e) => e.status === "completed").length} of ${singleTimelineEvents.length} steps completed`}
          </span>
          {currentStatus && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                currentStatus === "DELIVERED"
                  ? "bg-green-100 text-green-800"
                  : currentStatus === "DELIVERED_TO_TAILOR"
                    ? "bg-purple-100 text-purple-800"
                    : "bg-blue-100 text-blue-800"
              }`}
            >
              {currentStatus.replace("_", " ")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderTimelineCard;
