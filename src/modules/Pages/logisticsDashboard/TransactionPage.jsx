import { useState } from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import ReusableTable from "../salesDashboard/components/ReusableTable";
import { GeneralTransactionComponent } from "../../../components/GeneralTransactionComponents";

export default function TransactionPage() {
  return (
    <>
      <GeneralTransactionComponent />
    </>
  );
}
