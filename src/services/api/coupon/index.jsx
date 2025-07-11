import CaryBinApi from "../../CarybinBaseUrl";

const createCoupon = (payload, business_id) => {
  return CaryBinApi.post(`/coupon-management/create`, payload, {
    headers: {
      "Business-id": business_id,
    },
  });
};

const createAdminFabricProduct = (payload) => {
  return CaryBinApi.post(`/manage-fabric/create`, payload, {});
};

const getAllCoupon = (params) => {
  return CaryBinApi.get(`/coupon-management/fetch/${params?.business_id}`, {
    params,
  });
};

const getAdminFabricProduct = (params) => {
  return CaryBinApi.get(`/product-general/fetch`, {
    params,
    headers: {
      "Business-id": params.id,
    },
  });
};

const updateFabricProduct = (payload) => {
  return CaryBinApi.patch(`/fabric/${payload.id}`, payload, {
    headers: {
      "Business-id": payload.business_id,
    },
  });
};

const updateAdminFabricProduct = (payload) => {
  return CaryBinApi.patch(`/manage-fabric/${payload.id}`, payload, {
    headers: {
      "Business-id": payload.business_id,
    },
  });
};

const deleteFabricProduct = (payload) => {
  return CaryBinApi.delete(`/fabric/${payload.id}`, {
    headers: {
      "Business-id": payload.business_id,
    },
    data: payload,
  });
};

const deleteAdminFabricProduct = (payload) => {
  return CaryBinApi.delete(`/manage-fabric/${payload.id}`, {
    headers: {
      "Business-id": payload.business_id,
    },
    data: payload,
  });
};

const CouponService = {
  createCoupon,
  getAllCoupon,
};

export default CouponService;
