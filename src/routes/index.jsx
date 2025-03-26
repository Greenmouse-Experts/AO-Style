import { landingRooutes } from "./landingRoute";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { logisticsRoutes } from "./logisticsRoutes";
import { salesRoutes } from "./salesRoutes";
import { tailorRoute } from "./tailorRoutes";
import { fabricRoutes } from "./fabricRoutes";
export const routes = [
    ...landingRooutes,
    ...authRoutes,
    ...customerRoutes,
    ...logisticsRoutes,
    ...salesRoutes,
    ...tailorRoute,
    ...fabricRoutes,
];