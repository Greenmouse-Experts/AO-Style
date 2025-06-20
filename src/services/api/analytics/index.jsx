import CaryBinApi from "../../CarybinBaseUrl";

const getDashboardStat = () => {
  return CaryBinApi.get(`/owner-analytics/dashboard-stats`);
};

const AnalyticsService = {
  getDashboardStat,
};

export default AnalyticsService;
