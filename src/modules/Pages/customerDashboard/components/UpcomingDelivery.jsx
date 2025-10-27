import useQueryParams from "../../../../hooks/useQueryParams";
import useGetOrder from "../../../../hooks/order/useGetOrder";

export default function UpcomingDelivery() {
  const { queryParams, updateQueryParams } = useQueryParams({
    "pagination[limit]": 10,
    "pagination[page]": 1,
  });

  // Fetch orders (paginated)
  const {
    isPending,
    isLoading,
    isError,
    data: orderDataRaw,
  } = useGetOrder({
    ...queryParams,
  });

  console.log("This is the orsder data raw", orderDataRaw)

  // The data will likely be of the shape { data: [...] }
  const ordersRaw = orderDataRaw?.data ?? [];

  // Only show orders with OUT_FOR_DELIVERY or IN_TRANSIT status
  const filteredDeliveries = orderDataRaw?.filter(
    (order) =>
      order?.status === "OUT_FOR_DELIVERY" || order?.status === "IN_TRANSIT"
  );

  return (
    <div className="bg-white p-6 rounded-xl h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">Upcoming Delivery</h3>
      </div>

      {isLoading || isPending ? (
        <p className="flex items-center justify-center text-center my-auto h-full text-sm md:text-sm">
          Loading...
        </p>
      ) : filteredDeliveries.length ? (
        <div className="space-y-4">
          {filteredDeliveries.map((order) => {
            // Attempt to get a product name and image (style > fabric > fallback)
            const firstItem = Array.isArray(order.order_items) && order.order_items.length > 0
              ? order.order_items[0]
              : null;
            const productName =
              firstItem?.product?.name || order.title || "Order item";
            const productImg =
              firstItem?.product?.style?.photos?.[0] ||
              firstItem?.product?.fabric?.photos?.[0] ||
              firstItem?.metadata?.image ||
              "https://via.placeholder.com/56";

            // Estimate days left based on available fields
            // If order.days_left exists use that, otherwise fallback/leave blank
            const daysLeft =
              typeof order.days_left === "number"
                ? order.days_left
                : order?.expected_days_left ||
                  firstItem?.days_left ||
                  null;

            // UI logic for progress bar based on status
            let progress = 0;
            if (order.status === "OUT_FOR_DELIVERY") progress = 40;
            if (order.status === "IN_TRANSIT") progress = 80;

            // Highlight color based on days left
            const progressColor =
              daysLeft !== null && daysLeft <= 2
                ? "#F82424"
                : "#2CBA2C";

            return (
              <div key={order.id} className="flex items-center gap-3 mb-2">
                <img
                  src={productImg}
                  alt={productName}
                  className="w-14 h-14 rounded-md object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{productName}</p>
                  <div className="relative w-full h-1 bg-gray-300 rounded-full mt-4">
                    <div
                      className="absolute h-1 rounded-full"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: progressColor,
                        transition: "width 0.4s",
                      }}
                    />
                  </div>
                </div>
                <span
                  className={`text-xs ${
                    daysLeft !== null && daysLeft <= 2
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {daysLeft !== null && daysLeft !== undefined
                    ? `(${daysLeft} day${daysLeft === 1 ? "" : "s"} left)`
                    : ""}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="flex items-center justify-center text-center my-auto h-full text-sm md:text-sm">
          No upcoming delivery.
        </p>
      )}
    </div>
  );
}
