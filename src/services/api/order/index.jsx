import CaryBinApi from "../../CarybinBaseUrl";

const getAllOrder = (params) => {
  return CaryBinApi.get(`/orders`, {
    params,
  });
};

const getVendorOrder = (params) => {
  return CaryBinApi.get(`/orders/vendor/all`, {
    params,
  });
};

const getFetchVendorOrder = (params) => {
  return CaryBinApi.get(`/orders/fetch-vendor-orders`, {
    params,
  });
};

const getSingleOrder = async (id) => {
  console.log("🔗 OrderService.getSingleOrder called with ID:", id);
  console.log("🔗 Making API request to endpoint:", `/orders/details/${id}`);

  try {
    const response = await CaryBinApi.get(`/orders/details/${id}`);
    console.log("✅ OrderService.getSingleOrder success:", {
      status: response?.status,
      dataExists: !!response?.data,
      dataStructure: response?.data ? Object.keys(response.data) : [],
    });
    return response;
  } catch (error) {
    console.error("❌ OrderService.getSingleOrder error:", {
      orderId: id,
      endpoint: `/orders/details/${id}`,
      error: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      responseData: error?.response?.data,
    });
    throw error;
  }
};

const getCustomerSingleOrder = async (id) => {
  console.log("🔗 OrderService.getCustomerSingleOrder called with ID:", id);
  console.log("🔗 Making API request to customer endpoint:", `/orders/${id}`);

  try {
    const response = await CaryBinApi.get(`/orders/${id}`);
    console.log("✅ OrderService.getCustomerSingleOrder success:", {
      status: response?.status,
      dataExists: !!response?.data,
      dataStructure: response?.data ? Object.keys(response.data) : [],
    });
    return response;
  } catch (error) {
    console.error("❌ OrderService.getCustomerSingleOrder error:", {
      orderId: id,
      endpoint: `/orders/${id}`,
      error: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      responseData: error?.response?.data,
    });
    throw error;
  }
};

const OrderService = {
  getAllOrder,
  getSingleOrder,
  getCustomerSingleOrder,
  getVendorOrder,
  getFetchVendorOrder,
};

export default OrderService;
