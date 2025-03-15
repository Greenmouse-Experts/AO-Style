import { landingRooutes } from "./landingRoute";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
export const routes = [
    ...landingRooutes,
    ...authRoutes,
    ...customerRoutes,
];
