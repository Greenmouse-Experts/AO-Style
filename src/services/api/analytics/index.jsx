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

const AnalyticsService = {
  getDashboardStat,
  getCustomerOrderAnalyticsStat,
  getCustomerExpenses,
  getCustomerRecentOrders,
  getCustomerUpcomingDeliveries,
};

export default AnalyticsService;
