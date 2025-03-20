import { landingRooutes } from "./landingRoute";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { logisticsRoutes } from "./logisticsRoutes";
import { salesRoutes } from "./salesRoutes";
export const routes = [
    ...landingRooutes,
    ...authRoutes,
    ...customerRoutes,
    ...logisticsRoutes,
    ...salesRoutes,
];
