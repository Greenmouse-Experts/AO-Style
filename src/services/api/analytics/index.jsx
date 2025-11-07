import CaryBinApi from "../../CarybinBaseUrl";

const getDashboardStat = () => {
  return CaryBinApi.get(`/owner-analytics/dashboard-stats`);
};

const getCustomerOrderAnalyticsStat = () => {
  return CaryBinApi.get(`/customer-analytics/order-stats`);
};

const getCustomerExpenses = () => {
  return CaryBinApi.get(`/customer-analytics/expenses`);
};

const getCustomerRecentOrders = () => {
  return CaryBinApi.get(`/customer-analytics/recent-orders`);
};

const getCustomerUpcomingDeliveries = () => {
  return CaryBinApi.get(`/customer-analytics/upcoming-deliveries`);
};

const getVendorAnalyticsSummary = () => {
  return CaryBinApi.get(`/vendor-analytics/summary`);
};

const getVendorMetrics = () => {
  return CaryBinApi.get(`/vendor-analytics/monthly-revenue`);
};

const getVendorRecentOrders = () => {
  return CaryBinApi.get(`/vendor-analytics/recent-orders`);
};

const getVendorTopProduct = () => {
  return CaryBinApi.get(`/vendor-analytics/top-products`);
};
const getVendorTopSellingProducts = () => {
  return CaryBinApi.get(`/orders/top-selling-products`);
};

const AnalyticsService = {
  getVendorTopSellingProducts,
  getVendorTopProduct,
  getDashboardStat,
  getCustomerOrderAnalyticsStat,
  getCustomerExpenses,
  getCustomerRecentOrders,
  getCustomerUpcomingDeliveries,
  getVendorAnalyticsSummary,
  getVendorRecentOrders,
  getVendorMetrics,
};

export default AnalyticsService;
