import CaryBinApi from "../../CarybinBaseUrl";

const getCart = () => {
  return CaryBinApi.get(`/cart`);
};

const addCartProduct = (payload) => {
  return CaryBinApi.post(`cart/add`, payload);
};

const editProduct = (payload) => {
  return CaryBinApi.patch(`/product-category/${payload.id}`, payload);
};

const deleteCart = (payload) => {
  return CaryBinApi.delete(`/cart/item/${payload.id}`, payload);
};

const CartService = {
  addCartProduct,
  getCart,
  deleteCart,
};

export default CartService;
