import CaryBinApi from "../../CarybinBaseUrl";

const createCoupon = (payload, business_id) => {
  return CaryBinApi.post(`/coupon-management/create`, payload, {
    headers: {
      "Business-id": business_id,
    },
  });
};

const applyCoupon = (payload) => {
  return CaryBinApi.post(`/coupon-management/apply-coupon`, payload);
};

const createAdminFabricProduct = (payload) => {
  return CaryBinApi.post(`/manage-fabric/create`, payload, {});
};

const getAllCoupon = (params) => {
  return CaryBinApi.get(`/coupon-management/fetch/${params?.business_id}`, {
    params,
  });
};

const getAllCouponAdmin = (params) => {
  return CaryBinApi.get(`/coupon-management/fetch-all`, {
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

const updateCouponProduct = (payload) => {
  return CaryBinApi.patch(`/coupon-management/${payload.id}`, payload, {
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

const deleteCoupon = (payload) => {
  return CaryBinApi.delete(`/coupon-management/${payload.id}`, {
    data: payload,
  });
};

const CouponService = {
  createCoupon,
  getAllCoupon,
  deleteCoupon,
  updateCouponProduct,
  getAllCouponAdmin,
  applyCoupon,
};

export default CouponService;
