import { landingRooutes } from "./landingRoute";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { logisticsRoutes } from "./logisticsRoutes";
import { salesRoutes } from "./salesRoutes";
import { tailorRoutes } from "./tailorRoutes";
export const routes = [
    ...landingRooutes,
    ...authRoutes,
    ...customerRoutes,
    ...logisticsRoutes,
    ...salesRoutes,
    ...tailorRoutes
];