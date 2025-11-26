import { useState } from "react";
import AdminCharges from "./AdminCharges";
import RepCommission from "./RepCommsion";
import DeliveryFeeSettings from "./DeliveryFee";
import OrderDeliveryFeeSettings from "./OrderCharges";

type COMMISION_TAB = "commision" | "vendor charges" | "delivery" | "order";
export default function ChargeCommision() {
  const [tab, setTab] = useState<COMMISION_TAB>("commision");

  const tabs: COMMISION_TAB[] = [
    "commision",
    "vendor charges",
    "delivery",
    // "order",
  ];

  return (
    <div data-theme="nord">
      <div className="tabs tabs-lift">
        {tabs.map((t) => (
          <div
            key={t}
            className={`tab capitalize ${tab === t ? "tab-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </div>
        ))}
      </div>
      {tab === "commision" && (
        <div>
          <RepCommission />
        </div>
      )}
      {tab === "vendor charges" && (
        <div>
          <AdminCharges />
        </div>
      )}
      {tab === "delivery" && (
        <div>
          <DeliveryFeeSettings />
        </div>
      )}
      {tab == "order" && <OrderDeliveryFeeSettings />}
    </div>
  );
}
