import CaryBinApi from "../../CarybinBaseUrl";

const getCart = () => {
  return CaryBinApi.get(`/cart`);
};

const addCartProduct = (payload) => {
  return CaryBinApi.post(`/cart/add`, payload);
};

const addMultipleCartProduct = (payload) => {
  return CaryBinApi.post(`/cart/add-multiple`, payload);
};

const editProduct = (payload) => {
  return CaryBinApi.patch(`/product-category/${payload.id}`, payload);
};

const deleteCart = (payload) => {
  return CaryBinApi.delete(`/cart/item/${payload.id}`, payload);
};

const createPayment = (payload) => {
  return CaryBinApi.post(`/payment/create`, payload);
};

const verifyPayment = (payload) => {
  return CaryBinApi.post(`/payment/verify/${payload?.id}`);
};

const CartService = {
  addCartProduct,
  getCart,
  deleteCart,
  createPayment,
  verifyPayment,
  addMultipleCartProduct,
};

export default CartService;
