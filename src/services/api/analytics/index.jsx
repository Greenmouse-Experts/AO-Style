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

const getVendorRecentOrders = () => {
  return CaryBinApi.get(`/vendor-analytics/recent-orders`);
};

const getVendorTopProduct = () => {
  return CaryBinApi.get(`/vendor-analytics/top-products`);
};

const AnalyticsService = {
  getVendorTopProduct,
  getDashboardStat,
  getCustomerOrderAnalyticsStat,
  getCustomerExpenses,
  getCustomerRecentOrders,
  getCustomerUpcomingDeliveries,
  getVendorAnalyticsSummary,
  getVendorRecentOrders,
};

export default AnalyticsService;
