import { useMemo } from "react";
import Loader from "../../../../components/ui/Loader";
import useGetCustomerOrderStat from "../../../../hooks/analytics/useGetCustomerOrderStats";
import { formatNumberWithCommas } from "../../../../lib/helper";
import useGetCustomerExpensesStat from "../../../../hooks/analytics/useGetCustomerExpensesStat";

export default function StatsCard() {
  const { isPending, isLoading, isError, data } = useGetCustomerOrderStat();

  const {
    isPending: expensePending,
    isLoading: expenseLoading,
    isError: expenseError,
    data: customerExpensesStat,
  } = useGetCustomerExpensesStat();

  const stats = useMemo(
    () => [
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741980408/AoStyle/Group_38685_igl2sv.png",
        value: data?.data?.totalOrders,
        label: "Total Orders",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741980408/AoStyle/Group_38686_m8snct.png",
        value: data?.data?.ongoingOrders,
        label: "Ongoing Orders",
      },
      {
        image:
          "https://res.cloudinary.com/greenmouse-tech/image/upload/v1741980408/AoStyle/Group_386385_avoje8.png",
        value: `${
          expensePending || expenseLoading
            ? "Loading..."
            : formatNumberWithCommas(
                customerExpensesStat?.data?.fabricExpenses +
                  customerExpensesStat?.data?.styleExpenses
              )
        }`,
        label: "Total Spent",
      },
    ],
    [data?.data]
  );

  if (isPending || expensePending || expenseLoading || isLoading) {
    return (
      <div className="m-auto flex h-[80vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6 mt-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm min-w-0"
        >
          <div className="min-w-0 flex-1">
            <p className="text-xl font-bold leading-loose text-gray-900 truncate">
              {stat.value}
            </p>
            <p className="text-[#8299EA] text-sm">{stat.label}</p>
          </div>

          <div
            className={`w-16 h-16 lg:w-20 lg:h-20 flex items-center justify-center rounded-full flex-shrink-0 ml-4`}
          >
            <img
              src={stat.image}
              alt={stat.label}
              className="w-12 h-12 lg:w-14 lg:h-14"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
