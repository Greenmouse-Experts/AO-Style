import { landingRooutes } from "./landingRoute";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { logisticsRoutes } from "./logisticsRoutes";
import { salesRoutes } from "./salesRoutes";
import { tailorRoute } from "./tailorRoutes";
import { fabricRoutes } from "./fabricRoutes";
import NotFoundPage from "../components/ui/NotFoundPage";
// Admin Routes
import { adminRoutes } from "./adminRoutes";
// Admin Routes Ends
export const routes = [
    // Other Dashboard Routes
    ...landingRooutes,
    ...authRoutes,
    ...customerRoutes,
    ...logisticsRoutes,
    ...salesRoutes,
    ...tailorRoute,
    ...fabricRoutes,
    // Admin Routes
    ...adminRoutes,
    // Catch-All 404 Route
    {
        path: "*",
        element: <NotFoundPage />,
    },
];