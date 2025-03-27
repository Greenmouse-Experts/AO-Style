import { landingRooutes } from "./landingRoute";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { logisticsRoutes } from "./logisticsRoutes";
import { salesRoutes } from "./salesRoutes";
import { tailorRoute } from "./tailorRoutes";
import { fabricRoutes } from "./fabricRoutes";
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
];