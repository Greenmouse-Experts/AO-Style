import { landingRooutes } from "./landingRoute";
import { authRoutes } from "./authRoutes";
import { customerRoutes } from "./customerRoutes";
import { logisticsRoutes } from "./logisticsRoutes";
import { salesRoutes } from "./salesRoutes";
import { tailorRoute } from "./tailorRoutes";
import { fabricRoutes } from "./fabricRoutes";
import NotFoundPage from "../components/ui/NotFoundPage";
import ErrorPage from "../components/ErrorPage";
import ErrorBoundary from "../components/ErrorBoundary";
// Admin Routes
import { adminRoutes } from "./adminRoutes";
// Admin Routes Ends

// Wrap route groups with error boundaries for better error isolation
const wrapWithErrorBoundary = (routes, boundaryName) =>
  routes.map((route) => ({
    ...route,
    element: <ErrorBoundary>{route.element}</ErrorBoundary>,
  }));

export const routes = [
  // Root route with global error handling
  {
    path: "/",
    errorElement: <ErrorPage />,
    children: [
      // Other Dashboard Routes with error boundaries
      ...wrapWithErrorBoundary(landingRooutes, "Landing"),
      ...wrapWithErrorBoundary(authRoutes, "Auth"),
      ...wrapWithErrorBoundary(customerRoutes, "Customer"),
      ...wrapWithErrorBoundary(logisticsRoutes, "Logistics"),
      ...wrapWithErrorBoundary(salesRoutes, "Sales"),
      ...wrapWithErrorBoundary(tailorRoute, "Tailor"),
      ...wrapWithErrorBoundary(fabricRoutes, "Fabric"),
      // Admin Routes with error boundary
      ...wrapWithErrorBoundary(adminRoutes, "Admin"),
      // Catch-All 404 Route
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
];
