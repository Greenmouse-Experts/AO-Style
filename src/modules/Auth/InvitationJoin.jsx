import { useSearchParams } from "react-router-dom";
import MarketRepInvite from "./MarketRepInvite";
import SignInCustomer from "./SignInCustomer";
import SignInTailor from "./SignInTailor";
import SignInFabric from "./SigInFabric";
import SignInLogistics from "./SignInLogistics";
import NotFoundPage from "../../components/ui/NotFoundPage";

export default function InvitationJoin() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role");
  const token = searchParams.get("token");

  // If no token, show error
  if (!token) {
    return <NotFoundPage />;
  }

  // Route to appropriate component based on role
  switch (role) {
    case "market-representative":
      return <MarketRepInvite />;
    
    case "user":
      return <SignInCustomer />;
    
    case "fashion-designer":
      return <SignInTailor />;
    
    case "fabric-vendor":
      return <SignInFabric />;
    
    case "logistics-agent":
      return <SignInLogistics />;
    
    default:
      // If role is not recognized, show error or default to market-rep
      return <NotFoundPage />;
  }
}

